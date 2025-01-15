import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";

import { connectDB } from "./db/connectDB.js";

import authRoutes from "./routes/auth.route.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;             //creating a port environment variable 
const __dirname = path.resolve();                  //creating a directory name

app.use(cors({origin: "http://localhost:5173", credentials: true }));

//response back to server  for TESTING PURPOSE
// app.get("/", (req, res)=>{
//     res.send("Hello World!");
// })

app.use(express.json());  //allows us to parse incoming requests: req.body
app.use(cookieParser());  //alows us to parse incoing cookies

app.use("/api/auth", authRoutes);

if(process.env.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname, "/frontend/dist")));
    app.get("*", (req,res) => {
        res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
    });
 }

//checking for server that is it running on 3000 or not. if yes then in terminal it will displayed that server is running on port 3000
app.listen(PORT, () => {
    connectDB();
    console.log("Server is running on port: ", PORT);  
});



