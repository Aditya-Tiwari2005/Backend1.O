import { Router } from "express";
import { loginUser, logoutUser, registerUser, refreshAccessToken } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";



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

router.route("/login").post(loginUser)

// secured routes
router.route("/logout").post(verifyJWT ,logoutUser)
router.route("/refresh-token").post(refreshAccessToken)

export default router 