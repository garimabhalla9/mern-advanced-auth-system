import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (res, userId) => {                      //this will return u a token where we call the sign method and u r passing a playload i.e. userId so that when we decode the token so we get to know which user has this token. With the help of userId we can fetch the user profile from the database
    const token = jwt.sign({userId},process.env.JWT_SECRET, {
        expiresIn:"7d",
    })
    res.cookie("token", token, {
        httpOnly: true,    //cookie cannot be accessed by client side i.e. javascript. It prevents XSS attacks
        secure:process.env.NODE_ENV === "production",                //in localhost => http,  in production => https
        sameSite: "strict",   //it prevents csrf attack
        maxAge: 7 * 24 * 60 * 60 * 1000,          //7 days     
     });

     return token;
}