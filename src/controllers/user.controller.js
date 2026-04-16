import { asyncHandler } from "../utils/asyncHandler.js";
import {APIError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser =asyncHandler( async (req,res)=>{
    // res.status(200).json({
    //     message : "chai-aur-code"
    // })


    //user registration steps
    // get user details form frontend
    // validation -  not empty
    // check if user already exists: we can check using username,email mentioned in schema
    // check for images ,check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res
    

    const {fullname ,email, username ,password } = req.body
    console.log("email:",email);

    // for beginner :- if(fullname === ""){
    //     throw new APIError(400,"fullname is required")
    // }

    if (
        [fullname,email,username,password].some((field)=> field?.trim()==="")
    ) {
        throw new APIError(400,"All fields are requied")
    }
    const existedUser = User.findOne({
        $or:[{username} , {email}]
    })
    // console.log("User from DB:", existedUser);
    if (existedUser) {
        // console.log("❌ User already exists");
        throw new APIError(409,"User with email or username already exist")
       } 
// else {
//     console.log("✅ New user");
// }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new APIError(400,"Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new APIError(400,"Avatar file is required")
    }
    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage : coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new APIError(500,"Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser,"User registered successfully")
    )

})

export {registerUser}