import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;


// The `generateToken` function creates a JSON Web Token (JWT) that securely encodes the user’s information using a secret key (`JWT_SECRET`). It includes the user data as the payload and sets the token to expire in 15 days, allowing the user to stay authenticated during that period.

export const generateToken = (user: any) => {
    return jwt.sign({user}, JWT_SECRET, {expiresIn: "15d"});
}