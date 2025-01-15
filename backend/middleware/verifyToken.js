import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {                            //next is used to call the next function
    const token = req.cookies.token;
    if(!token) return res.status(401).json({success:false, message: "Unauthorized - no token provided"});
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        if(!decoded) return res.status(401).json({success: false, message: "Unauthorized - invalid token"})     //coming from the cookies.

        req.userId = decoded.userId
        next();    //it will call the next function.
    } catch (error) {
        console.log("Error in verifyToken ", error);
        return res.status(500).json({ success: false, message: "Server error"});
        
    }
}