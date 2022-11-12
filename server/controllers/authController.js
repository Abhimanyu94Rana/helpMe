import asyncHandler from "express-async-handler"
import { validationResult } from "express-validator"
import User from '../models/userModel.js'
import generateToken from "../utils/generateToken.js"
import {sendEmail} from '../utils/helper.js'
import Stripe from 'stripe'
const stripe = Stripe(process.env.STRIPE_SECRET_KEY)

// Login
const login = asyncHandler( async (req,res) => {

    try {

        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const {email,password} = req.body
        const user = await User.findOne({email})

        if(user && await user.matchPassword(password) ){            

            // Create stripe account for further payment flow if does not exists for the user
            if(user.stripeAccountId === null){
                const account = await stripe.accounts.create({
                    type: 'express',
                    country: user.countryCode,
                    email: user.email,
                    capabilities: {
                      card_payments: {requested: true},
                      transfers: {requested: true},
                    },
                });
                return res.json(account)
            }  
            
            // Update the type of user
            const updateUser = User.findByIdAndUpdate(user._id, {type},
                function (err, docs) {
                    if (err){
                        return res.status(400).json({
                            success: false,
                            errors: err
                        });
                    }                    
            });
            
            return res.status(200).json({
                status:true,
                message:"You are logged in successfully.",
                data:{
                    _id:user._id,
                    name:user.name,
                    email:user.email,
                    profilePic:user.profilePic,
                    countryCode:user.countryCode,
                    token:generateToken(user._id),
                    step:user.step,
                    type:user.type             
                }
            })
        }else{
            return res.status(404).json({
                status:false,
                message:"Invalid login credentials"
            })
        }
    } catch (error) {
        return res.status(404).json({
            status:false,
            message:error.message
        })
    }
    
})

// Register
const register = asyncHandler( async (req,res) => {

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }

    const {name,email,password,profilePic,countryCode} = req.body

    const userExists = await User.findOne({email})
    if(userExists){
        return res.status(400).json({
            status: false,
            message:'Email already exists'
        })
    }else{
        const step = 1
        // Update the type of user
       const type = req.body.type ? req.body.type : null        
       const user = await User.create({
            name,email,password,profilePic,countryCode,step,type
        })

        if(user){

            return res.status(400).json({
                status:true,
                message:"User created successfully",
                data:{
                    _id:user._id,
                    name:user.name,
                    email:user.email,
                    profilePic:user.profilePic,
                    countryCode:user.countryCode,
                    token:generateToken(user._id),
                    step:user.step,
                    type:user.type
                }
            });
        }else{
            return res.status(400).json({
                status: false,
                message:'User is not created'
            })            
        }
    } 
})

// Forgot Password
const forgotPassword = asyncHandler(async(req,res) => {
    const {email} = req.body
    const user = await User.findOne({email})
    if(user){

        //Generate and set password reset token
        user.generatePasswordReset();

        // Save the updated user object
        user.save()

        const body = `Hi ${user.username} \n 
        Please click on the following link ${link} to reset your password. \n\n 
        If you did not request this, please ignore this email and your password will remain unchanged.\n`
        const response = await sendEmail(email,"Forgot Password",body)
        return res.send(response)
    }
    return res.status(404).json({
        status:false,
        message:"User not found."
    })
})

export {
    login,
    register,
    forgotPassword
}