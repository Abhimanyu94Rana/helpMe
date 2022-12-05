import asyncHandler from "express-async-handler";
import Job from "../../models/jobModel.js";
import JobApply from "../../models/jobApplyModel.js";
import User from "../../models/userModel.js";
import Stripe from 'stripe'
const stripe = Stripe(process.env.STRIPE_SECRET_KEY)

const createJob = asyncHandler( async(req,res) => {

    try {
        
        const {
            title,description,cost,category,availability,address
        } = req.body
        const user = req.user._id
        const job = await Job.create({
            title,description,cost,category,user,availability,address
        })
    
        if(job){
    
            // Intergate Payment
            const session = await stripe.checkout.sessions.create({
                line_items: [
                    {
                        price_data:{
                            currency:process.env.CURRENCY,
                            product_data:{
                                name:job.title
                            },
                            unit_amount:job.cost
                        },
                        quantity: 1,
                    },
                ],
                mode: 'payment',
                success_url: `${process.env.BASE_URL}api/job/success/${job._id}`,
                cancel_url: `${process.env.BASE_URL}api/job/failure/${job._id}`,
            }); 
            return res.status(200).json({
                status:true,
                message:"Payment process has been started.",
                payment_url:session.url
            })
    
            // res.status(200)
            // res.json({
            //     status:true,
            //     message:"Job has been created successfully.",
            //     data:{
            //         _id:job._id,
            //         title:job.title,
            //         cost:job.cost
            //     }
            // })
        }
        
    } catch (error) {
        return res.status(404).json({
            status:false,
            message:error.message
        })
    }    
})

const success = asyncHandler(async(req,res) => {
    try {
         
        const job = await Job.findOneAndUpdate({_id:req.params.id,status:false},{status:true,payment:true},{new: true})
        if(job){
            return res.status(200).json({
                status:true,
                message:"Job has created successfully.",
                data:job
            })
        }
        return res.status(404).json({
            status:false,
            message:"Job not found"
        })

    } catch (error) {
        return res.status(404).json({
            status:false,
            message:error.message
        })
    }
})

const failure = asyncHandler(async(req,res) => {
    try {

        const job = await Job.findOneAndDelete({_id:req.params.id,status:false,payment:false})
        if(job){
            return res.status(200).json({
                status:true,
                message:"Job has not created due to payment failure."
            })
        }
        return res.status(404).json({
            status:false,
            message:"Job not found"
        })
    } catch (error) {
        return res.status(404).json({
            status:false,
            message:error.message
        })
    }
})

const getJobs =  asyncHandler( async(req,res) => {

    const user = req.user
    let jobs = {} 
    if(user && user.type == 1){ 
        // For need
        jobs = await Job.find({ 
            'user' : [user._id]     
        }).populate('category').populate('user');
    }else{ 
        // For help
        // jobs = await Job.find({ 
        //     'category' : [user.categories]     
        // }).populate('category').populate('user');
        
        // Get all hired Jobs and dont show these hired jobs in the job lists
        const hiredJobIds = await JobApply.find({isHired:true}).distinct('job')        
        jobs = await Job.find({ _id : { $nin: hiredJobIds }, status:true,payment:true}).populate('category').populate('user');
    }

    
    if(jobs.length > 0){
        res.status(200)
        res.json({
            status:true,
            data:jobs
        })
    }else{
        res.status(404)
        return res.send({
            status:false,
            message:"No jobs found."
        })
    }
}) 

const jobInfo = asyncHandler( async(req,res) => {

    try {

        const job = await Job.findById(req.params.id)
        if(job){
            return res.status(200).json({
                status:true,
                message:"Job found successfully",
                data:job
            })
        }
        return res.status(404).json({
            status:false,
            message:"Job not found"
        })
        
    } catch (error) {
        return res.status(404).json({
            status:false,
            message:error.message
        })
    }

})

const jobApplicants = asyncHandler(async(req,res) => {

    try {
        
        const user = req.user._id
        const jobIds = await Job.find({user:user}).select('_id').distinct('_id') 

        if(jobIds){ 

            const applicants = await JobApply.find({
                'job': { $in: jobIds}
            }).populate('user').populate('job');   
            
            if(applicants.length > 0){
                return res.status(200).json({
                    status:true,
                    data:applicants
                })
            }
            return res.status(404).json({
                status:false,
                message:"Nobody has applied on your jobs yet."
            })
        } 
        return res.status(404).json({
            status:false,
            message:"User has not created any job yet."
        })

    } catch (error) {
        return res.status(404).json({
            status:false,
            message:error.message
        })
    }   
   
})

const hire = asyncHandler(async(req,res) => {

    try {
        
        const applyJobId = req.params.id    
        const applyJob = await JobApply.findById(applyJobId)
    
        if(applyJob && applyJob.isHired === false){

            // Check if the owner of job is loggedIn user or not
            const user = req.user._id    
            const checkJob = await Job.find({_id:applyJob.job,user})
            if(checkJob){
                // Hire the applicant for the job
                const hired = await JobApply.findByIdAndUpdate(applyJobId,{isHired:true},{new: true})
                if(hired){
                    return res.status(200).json({
                        status:true,
                        message:"Hiring has been done successfully.",
                        data:hired
                    })
                }
                return res.status(404).json({
                    status:false,
                    message:"Some issue has been occurred in hiring process."
                })
            }
            return res.status(404).json({
                status:false,
                message:"Current logged in user is not owner of this job"
            })
        }

        return res.status(404).json({
            status:false,
            message:"Job is not found or already taken."
        })
        
    } catch (error) {
        return res.status(404).json({
            status:false,
            message:error.message
        })
    }
})

const endJob = asyncHandler( async(req,res) => {
    try { 

        const jobOwner = req.user._id
        const id = req.params.id    
        // Check if job is running or not
        const isJobRunning = await JobApply.findOne({_id:id,jobOwner:jobOwner,isHired:true,status:1})
        if(isJobRunning){    

            // Find Job
            const jobInfo = await Job.findById(isJobRunning.job);

            // Find helper (To whom payment will be sent after the job completion)
            const helper = await User.findById(isJobRunning.user)
            if(jobInfo && helper){

                // Send payment to helper
                const payment = await stripe.transfers.create({
                    amount: jobInfo.cost,
                    currency: process.env.CURRENCY,
                    destination: helper.stripeAccountId
                });
                
                if(payment.id){

                    // Change status of job to 2 (ended)
                    const status = 2 // 2:ended
                    const endTime = new Date() 
                    const jobApply = await JobApply.findByIdAndUpdate(id,{status,endTime},{new: true})
                    if(jobApply){
                        return res.status(200).json({
                            status:true,
                            message:"Job has ended successfully.",
                            data:jobApply
                        })
                    }
                    return res.status(404).json({
                        status:false,
                        message:"Some error has occurred. Job has not ended."
                    })
                }
                return res.status(404).json({
                    status:false,
                    message:"Some error has occurred while payment."
                })
                // Create a product
                // const product = await stripe.products.create({
                //     name: jobInfo.title,
                // });

                // if(product.id){
                    
                //     // Assign price to the product
                //     const price = await stripe.prices.create({
                //         unit_amount: jobInfo.cost,
                //         currency: process.env.CURRENCY,
                //         product: product.id,
                //     });

                //     if(price.id){

                //         // Send payment from admin account to helper
                //         const session = await stripe.checkout.sessions.create({
                //             line_items: [{
                //                 price: price.id,
                //                 quantity: 1,
                //             }],
                //             mode: 'payment',
                //             success_url: `${process.env.BASE_URL}api/job/end/success/${job._id}`,
                //             cancel_url: `${process.env.BASE_URL}api/job/end/failure/${job._id}`,
                //             payment_intent_data: {
                //                 application_fee_amount: 2,
                //                 transfer_data: {
                //                     destination: helper.stripeAccountId,
                //                 },
                //             },
                //         });

                //         if(session.url){
                //             return res.status(200).json({
                //                 status:true,
                //                 message:"Payment process has been started.",
                //                 payment_url:session.url
                //             })
                //         }
                //         return res.status(404).json({
                //             status:false,
                //             message:"Some error occurred. Please try again."
                //         });
                //     }
                //     return res.status(404).json({
                //         status:false,
                //         message:"Some error occurred while assigning the price to product on stripe."
                //     });
                // }
                // return res.status(404).json({
                //     status:false,
                //     message:"Some error occurred while creating the product on stripe."
                // });
            } 
            return res.status(404).json({
                status:false,
                message:"Job or Helper not found."
            })
        }
        return res.status(404).json({
            status:false,
            message:"This job is not running or may have ended."
        })
        
    } catch (error) {
        return res.status(404).json({
            status:false,
            message:error.message
        })
    }
})

const endSuccess = asyncHandler(async(req,res)=>{
    try {
        const status = 2 // 1:started, 2:ended
        const endTime = new Date()
        const jobApplyId = req.params.jobApplyId
        const jobApply = await JobApply.findByIdAndUpdate(jobApplyId,{status},{new: true})
        if(jobApply){
            return res.status(200).json({
                status:true,
                message:"Job has ended successfully.",
                data:jobApply
            })
        }
        return res.status(404).json({
            status:false,
            message:"JobApply not found."
        })

    } catch (error) {

        return res.status(404).json({
            status:false,
            message:error.message
        })
    }
})

const endFailure = asyncHandler(async(req,res)=>{
    try {
        
        return res.status(200).json({
            status:false,
            message:"Payment has been failed. Please try again."
        })

    } catch (error) {

        return res.status(404).json({
            status:false,
            message:error.message
        })
    }
})


export {
    createJob,
    success,
    failure,
    getJobs,
    jobInfo,
    jobApplicants,
    hire,
    endJob,
    endSuccess,
    endFailure
}