import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema = new Schema(
    {
        username : {
            type: String,
            required : true,
            unique : true,
            lowercase : true,
            trim : true,
            index : true //(searching field in enabled)searching can be easier using this.
        },
        email : {
            type: String,
            required : true,
            unique : true,
            lowercase : true,
            trim : true,
        },
        fullname : {
            type: String,
            required : true,
            trim : true,
            index : true
        },
        avatar : {
            type: String, //cloudinary url
            required : true,
        },
        coverImage : {
            type: String,
        },
        // It’s an array because a user watches multiple videos over time, not just one.
        watchHistory : [
            {
                type: Schema.Types.ObjectId,
                ref : "Video"
            }
        ],
        password : {
            type : String,
            required : [true , 'Password is required']
        },
        refreshToken : {
            type : String
        }
    },
    {
        timestamps:true
    }
)

userSchema.pre("save" , async function(next){
    if(!this.isModified("password")) return next(); //allows to not change the password after every modification in model.
    this.password = bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password) //checking the password by comparing the encrypted one and original one using bcrypt.
}
userSchema.methods.generateAccessToken =  function () {
    return jwt.sign(
        {
            _id:this._id,
            email : this.email,
            username : this.username,
            fullname : this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn : process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken =  function () {
    return jwt.sign(
        {
            _id:this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn : process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}
export const User = mongoose.model("User",userSchema)
