import { response } from "express"
import asyncHandler from "express-async-handler"
import User from '../models/userModel.js'
import generateToken from "../utils/generateToken.js"
import {sendEmail} from '../utils/helper.js'

// Login
const login = asyncHandler( async (req,res) => {

    const {email,password} = req.body
    const user = await User.findOne({email})

    if(user && await user.matchPassword(password) ){
        res.json({
            _id:user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            token: generateToken(user._id)
        })
    }else{
        res.status(404)
        res.json({
            status:false,
            message:"Invalid login credentials"
        })
    }
})

// Register
const register = asyncHandler( async (req,res) => {

    const {name,email,password,confirmPassword} = req.body

    const userExists = await User.findOne({email})
    if(userExists){
        res.status(400)
        return res.send({
            status: false,
            message:'Email already exists'
        });
    }else{

        const user = await User.create({
            name,email,password
        })

        if(user){
            res.status(200)
            res.json({
                status:true,
                message:"User created successfully",
                _id:user._id,
                name:user.name,
                email:user.email,
                token:generateToken(user._id)
            })
        }else{
            res.status(400)
            return res.send({
                status: false,
                message:'User is not created'
            });
        }
    }

    res.json(
        {name,email,password,confirmPassword}
    )
})

// Forgot Password
const forgotPassword = asyncHandler(async(req,res) => {
    const {email} = req.body
    const isExists = await User.findOne({email})
    if(isExists){
        const response = sendEmail(email,"forgot_password","lorem ipsum content")
        return res.send(response)
    }
    res.status(404)
    return res.send({
        status:false,
        message:"User not found."
    })
})

export {
    login,
    register,
    forgotPassword
}