import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodType } from 'zod';


export const validateRequest =
    (bodySchema?: ZodType, querySchema?: ZodType, paramsSchema?: ZodType) =>
    (req: Request, res: Response, next: NextFunction) => {
        try {
            console.log("RAW QUERY:", req.query);
            if (paramsSchema) req.params = paramsSchema.parse(req.params) as Record<string, string>;
            // if (querySchema) req.query = querySchema.parse(req.query) as any;
            if (querySchema) {
                console.log("Parsing QUERY with Zod...");
                const cleanQuery = Object.assign({}, req.query);
                const validatedQuery = querySchema.parse(cleanQuery);
                
                for (const key in req.query) {
                    delete (req.query as any)[key];
                }

                Object.assign(req.query, validatedQuery);
            }

            if (bodySchema) req.body = bodySchema.parse(req.body);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                next(error);
            } else {
                console.error('Validation Middleware Fatal Error:', error);
                next(error);
            }
        }
    };