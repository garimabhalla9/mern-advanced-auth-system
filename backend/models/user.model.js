import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        email:{
            type: String,
            required: true,
            unique: true,
        },
        password:{
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        lastLogin: {
            type: Date,
            default: Date.now,
        },
        isVerified: {                         // to check if the user account is verified or not
            type: Boolean,
            default: false,
        },
        resetPasswordToken: String,                 //for each user so that one want to update his/her password then it should be updated
        resetPasswordExpiresAt: Date,               //to make it secure we will expire it at for example: 1 hour
        verificationToken: String,                  //to verify users account
        verificationTokenExpiresAt: Date,           //to meake it secure we will expire it like after 6 hours or one day
    },
    {timestamps: true}  //mongoose.schema takes 2 objects. 2nd object is optional 
);             

//timestamps gives us the createat and updateat fields will be automatically added into the document

export const User = mongoose.model('User', userSchema);