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

        const {email,password,type} = req.body
        const user = await User.findOne({email})

        if(user && await user.matchPassword(password) ){            

            // Check if the user type is 2
            if(type == 2){
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
                    if(account.id){
                        const accountLink = await stripe.accountLinks.create({
                            account: account.id,
                            refresh_url: `${process.env.BASE_URL}api/auth/${user._id}/${account.id}/reauth`,
                            return_url: `${process.env.BASE_URL}api/auth/${user._id}/${account.id}/return`,
                            type: 'account_onboarding',
                        });
                        return res.status(200).json({
                            status:true,
                            message:"Please setup your stripe account using below given link.",
                            data:accountLink
                        })
                    }
                    return res.status(404).json({
                        status:false,
                        message:"Please try again or check."
                    })
                }
            }             
            
            // Update the user
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

// Stripe Reauth
const reauth = asyncHandler(async(req,res) => {

    return res.status(200).json({
        status:true,
        message:"This does not implemented yet."
    })

    // const userId = req.params.userId
    // const accountId = req.params.accountId
    // const updateUser = User.findByIdAndUpdate(userId, {stripeAccountId:accountId},
    //     function (err, docs) {
    //         if (err){
    //             return res.status(400).json({
    //                 status: false,
    //                 errors: err
    //             });
    //         }                    
    // });

    // return res.status(200).json({
    //     status:true,
    //     message:"Your account has been connected to stripe account."
    // })
})

// Stripe Return
const returnStripe = asyncHandler(async(req,res) => {
    
    const _id = req.params.userId
    const accountId = req.params.accountId

    const updateUser = User.findByIdAndUpdate(_id, {stripeAccountId:accountId},
        function (err, docs) {
            if (err){
                return res.status(400).json({
                    status: false,
                    errors: err
                });
            }                    
    });

    const user = await User.findById({_id})

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
    });
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
    reauth,
    returnStripe,
    register,
    forgotPassword
}