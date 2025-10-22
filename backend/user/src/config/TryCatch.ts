import { NextFunction, Request, RequestHandler, Response } from "express";


// TryCatch is a wrapper that takes any Express route handler and automatically adds a try...catch block around it.
// That way, you don’t have to write try-catch in every route manually.
const TryCatch = (handler: RequestHandler): RequestHandler => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await handler(req, res, next);
        } catch (error: any) {
            res.status(500).json({
                message: error.message
            })
        }
    }
}


export default TryCatch;