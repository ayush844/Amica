import mongoose, {Document, Schema} from "mongoose";
//{ Document, Schema } → TypeScript + Mongoose types:
// Document represents a single record in MongoDB.
// Schema defines the structure of that record (the “blueprint”).

//Interface → Schema → Model

export interface IUser extends Document {
    name: string;
    email: string;
}
//It extends Document, meaning:
// It behaves like a Mongoose document (with _id, save(), etc.).
// Plus, it includes two required properties: name and email.


// defines the structure of your MongoDB collection
// Schema<IUser> ensures the schema matches the IUser interface
const schema: Schema<IUser> = new Schema({ 
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
}, {
    timestamps: true, // automatically adds createdAt and updatedAt fields.
})


export const User = mongoose.model<IUser>("User", schema);
//The <IUser> generic ensures that:
// new User() expects an object matching the IUser type.
// TypeScript will alert you if you forget a field or use the wrong type.