import { asyncHandler } from "../utils/asyncHandler.js";
import {APIError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt  from "jsonwebtoken";
import { use } from "react";

const generateAccessAndRefreshTokens  = async(userId)=>
    {
    try {
        const user = await User.findById(userId) //It will find the user with help of userId
        const accessToken = user.generateAccessToken()  //in this step generating refreshtoken and access token
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken //storing refreshtoken in database
        await user.save({validateBeforeSave : false}) //in this step saved in database

        return {accessToken, refreshToken}

    } catch (error) {
    console.error("🔥 REAL ERROR:", error);
    throw new APIError(500, error.message);
}
}

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
    const existedUser = await User.findOne({
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
    console.log(req.files);
    
const avatarLocalPath = req.files?.avatar?.[0]?.path;
const coverImageLocalPath = req.files?.cover?.[0]?.path;

    if (!avatarLocalPath) {
        throw new APIError(400,"Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    let coverImageUrl = "";

    if (coverImageLocalPath) {
        const uploaded = await uploadOnCloudinary(coverImageLocalPath);
        coverImageUrl = uploaded?.url || "";
    }

    if (!avatar) {
        throw new APIError(400,"Avatar file is required")
    }
    const user = await User.create({
        fullname,
        avatar: avatar?.url,
        coverImage: coverImageUrl,
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

const loginUser = asyncHandler(async (req , res)=>{
    // req body se data le aao (req body -> data)
    // username or email
    // find the user 
    // password check
    // access and refersh token
    // send cookie 

    const {email,username,password} = req.body

    if (!(username || email)) {
        throw new APIError(400,"username or email is required")
    }

    const user = await User.findOne({
        $or: [{username},{email}]
    })

    if (!user) {
        throw new APIError(404,"User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new APIError(401,"Invalid user credentials")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

    //sending cookies

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly:true,
        secure: true
    }

    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken", refreshToken,options)
    .json(
        new ApiResponse(
            200,{
                user:loggedInUser , accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )

})

const logoutUser = asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set : {
                refreshToken:undefined
            }
        },
        {
            returnDocument: "after" //the response in return we got will be the new updated value
        }
    )

    const options = {
        httpOnly:true,
        secure: true
    }
    return res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken").json(new ApiResponse(200,{},"User logged Out"))
})


const refreshAccessToken = asyncHandler(async(req,res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new APIError(401,"unauthorized request")
    }

try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.ACCESS_TOKEN_SECRET
        )
        const user = await User.findById(decodedToken?._id)
        if(!user){
            throw new APIError(401,"Invalid refresh token")
        }
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new APIError(401,"Refresh token is exprired or used")
        }
    
        const options = {
            httpOnly :true,
            secure : true
        }
    
        const {accessToken , newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
    
        return res.status(200).cookie("accessToken", accessToken , options).cookie("refreshToken", newRefreshToken , options)
        .json(
            new ApiResponse(
                200,
                {accessToken , refreshToken:newRefreshToken},
                "Access token refreshed"
            )
        )
    
} catch (error) {
    throw new APIError(401 , error?.message || "Invalid refresh token")
}
})


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
}