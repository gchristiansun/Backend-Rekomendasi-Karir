import { Request, Response, NextFunction } from "express";
import * as authService from "./auth.service";
import {HttpError } from '../../utils/httpError'
import { comparePassword } from "../../utils/password";
import {
    signAccessToken,
    signRefreshToken,
    verifyRefreshToken,
} from '../../utils/jwt'
import { LoginUserInput, RegisterUserInput } from './auth.validation'
import {UserPayload } from '../../middleware/auth.middleware'

// Handle register user
export const registerUserHandler = async (
    req: Request<{}, {}, RegisterUserInput>,
    res: Response,
    next: NextFunction
) => {
    try {
        const { email, name, password } = req.body;
        const existingUser = await authService.findUserByEmail(email);
        if (existingUser) {
            throw new HttpError(409, 'Email already exists');
        }

        const user = await authService.createUser({
            name, 
            email,
            password
        })

        return res.status(201).json({
            message: 'User registered succesfully',
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        })
    } catch (error) {
        next(error);
    }
}

// Handle login user
export const loginUserHandler = async (
    req: Request<{}, {}, LoginUserInput>,
    res: Response,
    next: NextFunction 
) => {
    try {
        const { email, password } = req.body;
        const user = await authService.findUserByEmail(email);
        if (!user) {
            throw new HttpError(404, 'User not found');
        }
        if (!user.password) {
            throw new HttpError(401, 'Invalid email or password')
        }

        const isPasswordValid = await comparePassword(password, user.password)
        if (!isPasswordValid) {
            throw new HttpError(401, 'Invalid email or password')
        }

        const payload = { id: user.id, role: user.role };

        // Buat access token singkat dan refresh token yang lebih lama
        const accessToken = signAccessToken(payload);
        const refreshToken = signRefreshToken(payload);

        // Simpan refresh token ke database
        await authService.saveRefreshToken(user.id, refreshToken);

        // Simpan refresh token sebagai httpOnly cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 1000
        });

        // Kirim accss token sebagai JSON
        return res.status(200).json({
            accessToken,
            user: {
                id: user.id, 
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        next(error);
    }
}

// Endpoint refresh token
export const refreshAccessTokenHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const tokenFromCookie = req.cookies.refreshToken;
        if (!tokenFromCookie) {
            throw new HttpError(401, 'No refresh token provided');            
        }

        const payload = verifyRefreshToken(tokenFromCookie) as UserPayload;
        if (!payload) {
            throw new HttpError(403, 'Invalid or expired refresh token');
        }

        const user = await authService.findUserByToken(tokenFromCookie);
        if (!user || user.id !== payload.id) {
            throw new HttpError(403, 'Invalid token or user mismatch');
        }

        // Buat access token baru
        const newAccessToken = signAccessToken({
            id: user.id,
            role: user.role,
        })

        return res.status(200).json({
            accessToken: newAccessToken,
        })
    } catch (error) {
        next(error);
    }
}

// Endpoint logout
export const logoutUserHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const tokenFromCookie = req.cookies.refreshToken;

        if (tokenFromCookie) {
            await authService.clearRefreshToken(tokenFromCookie);
        }

        res.cookie('refreshToken', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            expires: new Date(0),
        })

        return res.status(200).json({
            message: 'Logged out successully'
        })
    } catch (error) {
        next(error);
    }
}