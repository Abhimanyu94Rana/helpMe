import asyncHandler from "express-async-handler";
import Job from "../models/jobModel.js";


const createJob = asyncHandler( async(req,res) => {
    const {
        title,description,cost,category,availability,address
    } = req.body
    const user = req.user._id
    const job = await Job.create({
        title,description,cost,category,user,availability,address
    })

    if(job){
        res.status(200)
        res.json({
            status:true,
            message:"Job has been created successfully."
        })
    }
})

const getJobs =  asyncHandler( async(req,res) => {
    const jobs = await Job.find({})

    if(jobs){
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

export {
    createJob,
    getJobs,
    jobInfo
}