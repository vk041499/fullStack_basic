import mongoose, {Schema} from "mongoose"
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


const registerSchema = new Schema({
    firstName: {  
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        trim: true,
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    city: {
        type: String,
        required: true,
        trim: true
    },
    state: {
        type: String,
        required: true,
        trim: true
    },
    country: {
        type: String,
        required: true,
        trim: true
    },
    zipCode: {
        type: String,
        required: true,
        trim: true
    },
    
    profilePicture: {
        type: String, // cloudinary url
        required: true,
    },
    refreshToken: {
        type: String,
        
    },
},{
    timestamps: true,
    
})

registerSchema.pre("save", async function (next) {
    const user = this;
    if (!user.isModified("password")) return next();

        user.password = await bcrypt.hash(user.password, 10);
        next();
});

registerSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
}

registerSchema.methods.generateAccessToken = function () {
   return jwt.sign(
    {
        _id: this._id,
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        phone: this.phone,
        address: this.address,  
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
)
}

registerSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            id: this._id
        },
         process.env.REFRESH_TOKEN_SECRET,
         {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
         }
    )
}


export const Register = mongoose.model("Register", registerSchema);