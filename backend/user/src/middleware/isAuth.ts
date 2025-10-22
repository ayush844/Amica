import { NextFunction, Request, Response } from "express";
import { IUser } from "../model/user.js";
import jwt, { JwtPayload } from "jsonwebtoken";


// This line extends the default Request type from Express by adding a new optional property user.
export interface AutheticatedRequest extends Request{
    user?: IUser | null;
    //user may or may not exist (that’s what ? means)
    // if it exists, it must match the IUser interface
    // or it can be null.
}

// isAuth is a TypeScript Express middleware that checks if the incoming request has a valid JWT token.
export const isAuth = async(req: AutheticatedRequest,res: Response, next: NextFunction): Promise<void> => {
// Takes the usual (req, res, next) arguments.
// Promise<void> in return because an async function never returns void directly. It always returns a Promise — either resolved or rejected.
    try {

        // Checks if the Authorization header exists and starts with "Bearer ".
        const authHeader = req.headers.authorization;

        if(!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({
                message: "Authentication failed. No token provided."
            })
            return;
        }

        const token = authHeader.split(" ")[1];
        if(!token) {
            res.status(401).json({
                message: "Authentication failed. No token provided."
            })
            return;
        }

        // jwt.verify() checks if the token is valid using your secret key.
        const decodedValue = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
        //If it’s valid, it returns the data inside the token (the payload).
        //The as JwtPayload tells TypeScript: “Hey, treat this decoded data as a JwtPayload object.”

        // If the token doesn’t contain a user → invalid.
        if(!decodedValue || !decodedValue.user) {
            res.status(401).json({
                message: "Authentication failed. Invalid token."
            })
            return;
        }

        // Otherwise, store that user on the request (req.user = ...), so that later route handlers can access req.user.
        req.user = decodedValue.user;

        next();

    } catch (error) {
        res.status(401).json({
            message: "PLEASE LOGIN - jwt verification failed"
        })
    }
}