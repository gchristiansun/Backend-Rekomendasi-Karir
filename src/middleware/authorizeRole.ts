import { Request, Response, NextFunction } from "express";
import { HttpError } from "../utils/httpError";

export const authorizeRole = (...allowedRoles: string[]) => {
    return (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            if (!req.user) {
                throw new HttpError(401, 'Unauthorized: User not authenticated');
            }

            const userRole = req.user.role;

            if (allowedRoles.length === 0) {
                throw new HttpError(500, 'RBAC misconfigurationL No roles provided');            
            }

            const isAllowed = allowedRoles.includes(userRole);

            if (!isAllowed) {
                throw new HttpError(403, `Forbidden: Role '${userRole}' does not have access`)            
            }

            next();
        } catch (error) {
            next(error);
        } 
    };
}