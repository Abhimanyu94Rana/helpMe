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
        const user = req.user._id

        const jobApply = await JobApply.create({job,user})
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
    } catch (error) {
        return res.status(404).json({
            status:false,
            message:error.message
        })
    }
    
})

export {
    // getJobs,
    applyJob
}