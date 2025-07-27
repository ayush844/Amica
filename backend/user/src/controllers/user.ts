import { Response } from "express";
import { generateToken } from "../config/generateToken.js";
import { publishToQueue } from "../config/rabbitmq.js";
import TryCatch from "../config/TryCatch.js";
import { redisClient } from "../index.js";
import { AutheticatedRequest } from "../middleware/isAuth.js";
import { User } from "../model/user.js";

export const loginUser = TryCatch(async(req, res) => {
    const {email} = req.body;

    const rateLimitKey = `otp:ratelimit:${email}`;

    const rateLimit = await redisClient.get(rateLimitKey);
    if(rateLimit) {
        return res.status(429).json({
            message: "Too many requests. Please try again later."
        });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const otpKey = `otp:${email}`;
    await redisClient.set(otpKey, otp, {
        EX: 300 // OTP valid for 5 minutes
    })

    await redisClient.set(rateLimitKey, "true", {
        EX: 60 // Rate limit for 1 minute
    })

    const message = {
        to: email,
        subject: "YAPP OTP verification",
        body: "Hey there! Your OTP for YAPP is " + otp + ". It is valid for 5 minutes."
    }

    await publishToQueue("send-otp", message);

    res.status(200).json({
        message: "OTP sent to your email."
    });
})


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


export const myProfile = async(req: AutheticatedRequest, res: Response) => {
    const user = req.user;

    res.json(user);
}


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


export const getAllUsers = TryCatch(async(req: AutheticatedRequest, res: Response) => {
    const users = await User.find();

    res.json(users);
})


export const getAUser = TryCatch(async(req: AutheticatedRequest, res: Response) => {
    const user = await User.findById(req.params.id);

    res.json(user);
})