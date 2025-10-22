import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import {createClient} from 'redis';
import userRoutes from './routes/user.js';
import { connectRabbitMQ } from './config/rabbitmq.js';
import cors from 'cors';

// Reads values from your .env file
dotenv.config();

// Establishes connections to MongoDB and RabbitMQ
connectDB();

connectRabbitMQ();

// Creates a Redis client instance that can be imported and used elsewhere in your app.
export const redisClient = createClient({
    url: process.env.REDIS_URL
})

// Connects asynchronously and logs whether it was successful or not.
redisClient.connect().then(() => {
    console.log("Connected to Redis successfully");
}).catch((error) => {
    console.error("Failed to connect to Redis: ", error);
})


const app = express();

app.use(express.json());

app.use(cors());

app.use("/api/v1", userRoutes);


const PORT = process.env.PORT;




app.listen(PORT, () => {
    console.log(`User service is running on port ${PORT}`);
})