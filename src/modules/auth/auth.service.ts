import prisma from '../../config/prisma';
import { hashPassword } from '../../utils/password';
import { RegisterUserInput } from './auth.validation';
// import { user_role } from '@prisma/client';

// Cek keberadaan email
export const findUserByEmail = async (email: string) => {
    return await prisma.user.findUnique({
        where: {email},
    })
}

// Buat user baru 
export const createUser = async (input: RegisterUserInput) => {
    const hashedPassword = await hashPassword(input.password);

    const user = await prisma.user.create({
        data: {
            name: input.name,
            email: input.email,
            password: hashedPassword,
            // role: user_role.customer,
        }
    })
    return user;
}

// Simpan refresh token
export const saveRefreshToken = async (userId: string, refreshToken: string) => {
    return await prisma.user.update({
        where: { id: userId },
        data: {
            refresh_token: refreshToken,
        }
    })
}

// Hapus refresh token ketika logout
export const clearRefreshToken = async (token: string) => {
    return await prisma.user.update({
        where: { refresh_token: token },
        data:{
            refresh_token: null,
        }
    })
}

// Cari user berdasarkan refresh token
export const findUserByToken = async (token: string) => {
    return await prisma.user.findUnique({
        where: {
            refresh_token: token,
        }
    })
}