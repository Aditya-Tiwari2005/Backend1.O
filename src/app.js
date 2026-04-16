import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"


const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())
 
// routes

import userRouter from './routes/user.routes.js'

//routes declaration
app.use("/api/v1/users",userRouter) 

// https://localhost:8000//api/v1/users/register phle jaaunga /api/v1/users then from here the userRouter will activate then /register lgega toh register user call ho jaaega jab user register user ki defintion pe jaaenge (ek higher order function hai)toh ek response mil jaaega message 200 OK . 
export { app } 