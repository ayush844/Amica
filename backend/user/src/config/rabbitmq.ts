import amqp from 'amqplib';

let channel: amqp.Channel;



// Establishes a connection to the RabbitMQ server and creates a channel for sending/receiving messages.
// steps: Connect → Create Channel → Confirm
export const connectRabbitMQ = async () => {
    try {
        // 1) Connect to RabbitMQ using credentials from environment variables.
        const connection = await amqp.connect({
            protocol: 'amqp',
            hostname: process.env.RABBITMQ_HOST,
            port: 5672,
            username: process.env.RABBITMQ_USER,
            password: process.env.RABBITMQ_PASSWORD,
        });
        // 2) Create a channel — the main communication line used to send/receive messages.
        channel = await connection.createChannel();
        console.log("😘 Connected to RabbitMQ successfully");
    } catch (error) {
        console.error("Failed to connect to RabbitMQ: ", error);
        process.exit(1);
    }
}


// Sends a message to a specific queue.
// steps: Check → Assert → Send → Success
export const publishToQueue = async (queueName: string, message: any) => {
    // Check if the channel is ready.
    if(!channel){
        console.log("RabbitMQ channel is not initialized");
        return;
    }else{
        try {
            // Ensure queue exists using assertQueue(). (Creates the queue if it doesn’t already exist.)
//durable: true → makes the queue survive RabbitMQ restarts (the queue won’t disappear if the server restarts).
            await channel.assertQueue(queueName, { durable: true });

            // Send the message to the queue using sendToQueue(). (Convert the message to a buffer and mark it as persistent.)
//persistent: true → makes the message survive RabbitMQ restarts (message is stored on disk, not just in memory).
            channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), { persistent: true });

            console.log(`Message sent to queue ${queueName}:`, message);
        } catch (error) {
            console.error("Failed to publish message to RabbitMQ:", error);
        }
    }
}
