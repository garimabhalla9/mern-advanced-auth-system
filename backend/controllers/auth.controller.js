import bcryptjs from 'bcryptjs';
import crypto from "crypto";

import { User } from "../models/user.model.js";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import { sendPasswordResetEmail, sendResetSuccessEmail, sendVerificationEmail, sendWelcomeEmail } from "../mailtrap/emails.js";


export const signup = async (req, res) => {
    //postman
    const {email, password, name} = req.body;             //user will send us some email,passwrd,name and we can extract all of them from req.body
    try{
        if(!email || !password || !name){
            throw new Error("All fields are required");
        }
        const userAlreadyExists = await User.findOne({email});
        console.log("userAlreadyExists", userAlreadyExists);                    //user if it already exists and will check it with email
        
        if(userAlreadyExists){
            return res.status(400).json({success:false, message: "User already exists" });
        }

        const hashedPassword = await bcryptjs.hash(password,10);                  //not readable by user
        //123456  => $_121@X$^&*()
        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
        const user = new User({                               //create a user
            email,
            password: hashedPassword,
            name,
            verificationToken,
            verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000,           //24 hours
        });

        await user.save();

        // Create jwt token and set the cookie 
        generateTokenAndSetCookie(res, user._id);

        await sendVerificationEmail(user.email,verificationToken);

        res.status(201).json({
            success:true,
            message:"User created successfully",
            user:{
                ...user._doc,
                password: undefined,
            },
        });

    }catch(error){
        res.status(400).json({success:false, message: error.message });
    }
};

export const verifyEmail = async(req, res) => {
    // - - - - - -  or  1 2 3 4 5 6
    const {code} = req.body;
    try{
        const user = await User.findOne( {                    
            verificationToken: code,
            verificationTokenExpiresAt: { $gt: Date.now() }         //token is not expired
        })

        if(!user){
            return res.status(400).json({success: false, message: "Invalid or expired verification code"})
        }

        user.isVerified=true;
        user.verificationToken=undefined;                        //deleting these 2 as no need
        user.verificationTokenExpiresAt=undefined;
        await user.save();                                    //saving user to database

        await sendWelcomeEmail(user.email, user.name);

        res.status(200).json({
            success:true,
            message:"Email verified successfully",
            user:{
                ...user._doc,
                password: undefined,
            },
    })
    }catch(error){
        console.log("error in verifyEmail ", error);
        res.status(500).json({ success:false ,message: "Server error" });
    }
}

export const login = async (req, res) => {
    const {email, password} = req.body;             //user will provide us
    try{
        const user = await User.findOne({email});                //email will find from DB
        if(!user){
            return res.status(400).json({success: false, message: "Invalid Credentials"});

        }
        const isPasswordValid = await bcryptjs.compare(password, user.password);           //comparing the password to the one which we have in database.
        if(!isPasswordValid) {
            return res.status(400).json({success:false, message:"Invalid credentials"});
        }

        generateTokenAndSetCookie(res, user._id);

        user.lastLogin = new Date();             // user's lastLogin
        await user.save();                      //save to database

        res.status(200).json({
            success:true,
            message: "Logged in successfully",
            user:{
                ...user._doc,
                password: undefined,
            },
        });

    }catch(error) {
        console.log("Error in Login", error);
        
        res.status(400).json({ success:false, message: error.message});
    }


}

export const logout = async (req, res) => {
    res.clearCookie("token");
    res.status(200).json({success: true, message: "Logged out successfully" });
}

export const forgotPassword = async (req, res) => {
    const {email} = req.body;
    try{
        const user = await User.findOne({email});

        if(!user){
            return res.status(400).json({success: false, message: "User not found"});

        }

        //Generate reset token
        const resetToken=crypto.randomBytes(20).toString("hex");
        const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000;     // 1 hour token

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpiresAt = resetTokenExpiresAt;

        await user.save();

        //send reset email
        await sendPasswordResetEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`);

        //sending response back
        res.status(200).json({ success: true, message: "Password reset link sent to your email"});
    }catch(error){
        console.log("Error in forgotPassword ", error);
        res.status(400).json({success: false, message: error.message});
    }
}

export const resetPassword = async (req,res) => {
    try {
        const {token} = req.params  ;     //extracting token from params which is present in route
        const {password} = req.body;      

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpiresAt: {$gt: Date.now() },                  //that this token is not expired

        });

        if(!user){
            return res.status(400).json({success:false, message:"Invalid or expired reset token"});
        }

        //update password
        const hashedPassword = await bcryptjs.hash(password, 10);

        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiresAt = undefined;

        await user.save();

        // send reset success email
        await sendResetSuccessEmail(user.email);
        res.status(200).json({success: true, message: "Password reset successfully"});
    } catch (error) {
        res.status(400).json({success: false, message: error.message});
    }
}

export const checkAuth = async (req, res) => {                           //we fetch the user from database and send the response.
    try {
        const user = await User.findById(req.userId).select("-password");
        if(!user){
            return res.status(400).json({success: false, message: "User not found"});
        }

        res.status(200).json({success: true, user });

    } catch (error) {
        console.log("Error in checkAuth ", error);
        res.status(400).json({success: false, message: error.message});       
    }
}
