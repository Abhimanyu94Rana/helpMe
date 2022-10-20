import asyncHandler from "express-async-handler";
import dotenv from 'dotenv'
import Stripe from 'stripe'
import Job from "../models/jobModel.js";

dotenv.config()

const stripe = Stripe(process.env.STRIPE_SECRET_KEY)

const payment = asyncHandler( async(req,res) => {

    try { 

        const jobInfo = await Job.findById(req.params.id)
        if(jobInfo){
             
            const session = await stripe.checkout.sessions.create({
                line_items: [
                    {
                        price_data:{
                            currency:'inr',
                            product_data:{
                                name:jobInfo.title
                            },
                            unit_amount:jobInfo.cost
                        },
                        quantity: 1,
                    },
                ],
                mode: 'payment',
                success_url: `${process.env.BASE_URL}success`,
                cancel_url: `${process.env.BASE_URL}cancel`,
            }); 
            return res.status(200).json({
                status:true,
                message:"Payment process has been started.",
                data:{
                    url:session.url
                }
            })
        }

        return res.status(404).json({
            status:false,
            message: `Job ${jobId} not found.`
        })

    } catch (error) {
        return res.status(404).json({
            status:false,
            message:error.message
        })
    }
    
})

export {
    payment
}