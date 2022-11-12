import asyncHandler from "express-async-handler";
import Job from "../../models/jobModel.js";
import JobApply from "../../models/jobApplyModel.js";


// const getJobs =  asyncHandler( async(req,res) => {

//     const user = req.user
//     let jobs = {} 
//     if(user && user.type == 1){ 
//         // For need
//         jobs = await Job.find({ 
//             'user' : [user._id]     
//         }).populate('category').populate('user');
//     }else{ 
//         // For help
//         // jobs = await Job.find({ 
//         //     'category' : [user.categories]     
//         // }).populate('category').populate('user');
//         const hiredJobIds = await JobApply.find({isHired:true}).distinct('job')
//         return res.json(hiredJobIds)
//         jobs = await Job.find({}).populate('category').populate('user');
//     }

    
//     if(jobs){
//         res.status(200)
//         res.json({
//             status:true,
//             data:jobs
//         })
//     }else{
//         res.status(404)
//         return res.send({
//             status:false,
//             message:"No jobs found."
//         })
//     }
// }) 

const applyJob = asyncHandler( async(req,res) => {

    try {
        const job = req.params.id

        // Find job and get job owner id
        const jobInfo = await Job.findById(job)
        if(jobInfo){
            const jobOwner = jobInfo.user   
            const user = req.user._id

            // Check if user has already applied on the job or not
            const checkIfUserApplied = await JobApply.find({user})            
            if(checkIfUserApplied.length > 0){
                return res.status(404).json({
                    status:false,
                    message:"User has already applied on this job."
                })
            }

            const jobApply = await JobApply.create({job,jobOwner,user})
            if(jobApply){
                return res.status(200).json({
                    status:true,
                    message:"Applied on job successfully.",
                    data:jobApply
                })
            }
            return res.status(404).json({
                status:false,
                message:"Not applied on job successfully."
            })          
        }
        return res.status(404).json({
            status:false,
            message:"Job not found."
        })
        
    } catch (error) {
        return res.status(404).json({
            status:false,
            message:error.message
        })
    }
    
})

const startJob = asyncHandler( async(req,res) => {
    try {
        const job = req.params.id
        const user = req.user._id
        const status = 1 // 1:started
        const startTime = new Date()
        const jobApply = await JobApply.findOneAndUpdate({job,user:user},{status,startTime},{new:true})
        if(jobApply){
            return res.status(200).json({
                status:true,
                message:"Job has started successfully.",
                data:jobApply
            })
        }
        return res.status(404).json({
            status:false,
            message:"User does not applied on this job or job not found."
        })
    } catch (error) {
        return res.status(404).json({
            status:false,
            message:error.message
        })
    }
})

export {
    // getJobs,
    applyJob,
    startJob
}