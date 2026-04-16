import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"



const router = Router()

router.route("/register").post(
    //injecting the middle it is in middle jaate hue mujhese milke jaana
    upload.fields([ //You are telling multer:“Accept files from these fields”.👉 This returns a middleware function
        {
            name:"avatar",
            maxCount:1
        },
        {
            name : "cover",
            maxCount :1
        }
    ]),
    registerUser
)

export default router 