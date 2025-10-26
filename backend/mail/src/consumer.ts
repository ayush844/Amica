import amqp from 'amqplib';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';


dotenv.config();

export const startSendOTPConsumer = async () => {
    try {
        // It establishes a connection to the RabbitMQ broker.
        const connection = await amqp.connect({
            protocol: 'amqp',
            hostname: process.env.RABBITMQ_HOST,
            port: 5672,
            username: process.env.RABBITMQ_USER,
            password: process.env.RABBITMQ_PASSWORD,
        })

        // A channel is like a lightweight connection to send/receive messages through the same main connection.
        const channel = await connection.createChannel();

        const queueName = 'send-otp';

        // Declare or ensure a queue exists:
        // durable: true makes sure the queue will survive broker restarts.
        await channel.assertQueue(queueName, {durable: true});

        console.log("😘 mail service consumer started, listening for otp emails")

        // channel.consume() starts a consumer that receives messages from the queue whenever a publisher sends one.
        // Each message (msg) contains the data needed to send an OTP email.
        channel.consume(queueName, async (msg) => {
            if(msg){
                try {
                    const {to, subject, body} = JSON.parse(msg.content.toString());

                    // this configures SMTP connection to Gmail.
                    // SMTP (Simple Mail Transfer Protocol) is the standard way emails are sent from one server or app to another.
                    const transporter = nodemailer.createTransport({
                        host: 'smtp.gmail.com',
                        port: 465,
                        secure: true,
                        auth: {
                            user: process.env.EMAIL_USER,
                            pass: process.env.PASSWORD
                        }
                    })

                    // Sends a plain text email from "Amica" to the recipient.
                    await transporter.sendMail({
                        from: 'Amica',
                        to,
                        subject,
                        text: body
                    })

                    console.log(`OTP mail sent to ${to}`);

                    channel.ack(msg);

                } catch (error) {
                    console.log("failed to send OTP : ", error);
                }
            }
        })
    } catch (error) {
        console.log("failed to start rabbitMQ consumer: ", error);
    }
}
