import User from "../models/userModel.js";
import asyncHandler from "express-async-handler";

const profile = asyncHandler( async (req,res) => {
    
    const user = await User.findById(req.user._id).select('-password')

    if(user){
        res.status(200).json({
            status:true,
            data:user
        })
        
    }else{
        res.status(404).json({
            status:false,
            message:"User not found."
        })
        
    }
})

// Update Profile
const updateProfile = asyncHandler( async(req,res) => {
    
    try {  
        const postData = req.body
        const user = await User.findOneAndUpdate(
            {_id:req.user._id},
            {$set: postData},
            { new: true, upsert: true, setDefaultsOnInsert: true }
        )
        return res.status(200).json({
            status:true,
            message:"Profile has been updated successfully.",
            data:user
        })
    } catch (error) {
        return res.status(404).json({
            status:false,
            message:error.message
        })
    }    
})

export {
    profile,
    updateProfile
}