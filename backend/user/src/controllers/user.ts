import { Response } from "express";
import { generateToken } from "../config/generateToken.js";
import { publishToQueue } from "../config/rabbitmq.js";
import TryCatch from "../config/TryCatch.js";
import { redisClient } from "../index.js";
import { AutheticatedRequest } from "../middleware/isAuth.js";
import { User } from "../model/user.js";


// function works in multiple steps:
// 1) Checks if the user has recently requested an OTP (rate limiting).
// 2) Generates a new 6-digit OTP.
// 3) Stores it temporarily in Redis (for verification later).
// 4) Publishes a message to RabbitMQ so another service (email sender) can email the OTP.
// 5) Sends a success response back.
export const loginUser = TryCatch(async(req, res) => {
    const {email} = req.body;

    // A unique key in Redis for this user’s email — used to ensure they don’t spam OTP requests.
    const rateLimitKey = `otp:ratelimit:${email}`;

    // If Redis already has this key, it means the user requested an OTP within the last minute.
    const rateLimit = await redisClient.get(rateLimitKey);
    if(rateLimit) {
        return res.status(429).json({
            message: "Too many requests. Please try again later."
        });
    }

    // Creates a 6-digit random OTP between 100000–999999.
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const otpKey = `otp:${email}`;

    // Saves OTP in Redis with a key like otp:user@gmail.com.
    await redisClient.set(otpKey, otp, {
        EX: 300 // OTP valid for 5 minutes
    })
    //Key name: otp:${email} → e.g. otp:ayush@gmail.com
    //Value: the actual OTP code (like "123456")


    //Marks this user as "recently requested OTP".
    // The key expires in 60 seconds → meaning the user can request again after 1 minute.
    await redisClient.set(rateLimitKey, "true", {
        EX: 60 // Rate limit for 1 minute
    })
    //Key name: otp:ratelimit:${email} → e.g. otp:ratelimit:ayush@gmail.com
    //Value: "true" (just a marker — we don’t care about content)


//This is the message that another service (worker) will use to send the email.
    const message = {
        to: email,
        subject: "Amica OTP verification",
        body: "Hey there! Your OTP for Amica is " + otp + ". It is valid for 5 minutes."
    }

    // Sends the message to a queue named "send-otp".
    //Another service (email microservice) will pick it up and send the actual email.
    await publishToQueue("send-otp", message);

    res.status(200).json({
        message: "OTP sent to your email."
    });
})


// It verifies the OTP entered by the user, creates a user if they don’t exist, and returns a JWT token for authentication.
export const verifyUser = TryCatch(async(req, res) => {
    const {email, otp: EnteredOtp} = req.body;

    if(!email || !EnteredOtp){
        res.status(400).json({
            message: "Email and OTP required",
        })
        return;
    }

    const otpKey = `otp:${email}`;
    const storedOtp = await redisClient.get(otpKey);

    if(!storedOtp || storedOtp !== EnteredOtp) {
        res.status(400).json({
            message: "Invalid OTP"
        })
        return;
    }

    await redisClient.del(otpKey); // Delete OTP after verification

    let user = await User.findOne({email});

    if(!user){
        const name = email.split("@")[0];
        user = await User.create({name, email});
    }

    const token = generateToken(user);

    res.json({
        message: "User verified successfully",
        user,
        token
    })


})


// Fetches and returns the logged-in user’s profile.
export const myProfile = async(req: AutheticatedRequest, res: Response) => {
    const user = req.user;

    res.json(user);
}


// Updates the user’s name and returns the updated profile with a new token.
export const updateName = TryCatch(async(req: AutheticatedRequest, res: Response) => {
    const user = await User.findById(req.user?._id);

    if(!user){
        res.status(404).json({
            message: "Please Login"
        });
        return;
    }

    user.name = req.body.name || user.name;
    await user.save();

    const token = generateToken(user);

    res.json({
        message: "User updated successfully",
        user,
        token
    });
})


// Fetches and returns all users from the database.
export const getAllUsers = TryCatch(async(req: AutheticatedRequest, res: Response) => {
    const users = await User.find();

    res.json(users);
})


// Fetches and returns a single user by their ID.
export const getAUser = TryCatch(async(req: AutheticatedRequest, res: Response) => {
    const user = await User.findById(req.params.id);

    res.json(user);
})