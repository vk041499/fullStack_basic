import { Register } from "../models/register.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";


const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await Register.findById(userId);
        if (!user) {
            throw new apiError(404, "User not found");
        }

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new apiError(500, "Something went wrong while generating tokens");
    }
};



const registerUser = asyncHandler(async (req, res) => {
    const { firstName,lastName, email, password, phone, address, city,
            state, country, zipCode1 } = req.body;


    // Check if the request contains Profile Picture
    const profilePictureLocalPath = req.files?.profilePicture[0]?.path;

    if (!profilePictureLocalPath) {
        throw new apiError(400, "Profile Picture file is required")
    }

    const profile = await uploadOnCloudinary(profilePictureLocalPath)

    if(!profile) {
        throw new apiError(400 , "Profile Picture file have to be required");
        
    }

    // Validate the request body
    if(
        [firstName,lastName,email,password,phone,address,city,state,country,zipCode1].some((field) => 
            field?.trim() === "")

    ){
        throw new apiError(400, "All fields are required")  
    }

    // Check if user already exists
    const existedUser = await Register.findOne({
        $or: [{ email }]
     })
     if(existedUser){
         throw new apiError(409,"User with email already exists")
     }

    // Create a new user
    const user = await Register.create({
        firstName,lastName,
        profilePicture: profile.url,
        email,
        password,
        phone,
        address,
        city,
        state,
        country,
        zipCode:zipCode1
    });

    const createdUser = await Register.findById (user._id).select(
        "-password -refreshToken"
    ) 
    if(!createdUser){
        throw new apiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new apiResponse(200, createdUser, "User registered Successfully")
    )

});

const loginUser = asyncHandler(async (req,res) => {
    // req body -> data
    // username or email
    // find the user
    // password check
    // access and refresh token
    // send cookies

    const {email,password} = req.body

    if (!email) {
        throw new apiError (400, " email is required")
    }

    const user = await Register.findOne({
        $or: [{email}]
    })

    if (!user) {
        throw new apiError(404, "User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect
    (password)

    if (!isPasswordValid) {
        throw new apiError(401, "Invalid user credentials")
    }

    const {accessToken , refreshToken} = await
    generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await Register.findById(user._id).
    select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res 
    .status(200)
    .cookie("accessToken", accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new apiResponse(
            200,
            {
                user: loggedInUser , accessToken,
                refreshToken
            },
            "User logged in Successfully"
        )
    )

});



export {registerUser, loginUser}