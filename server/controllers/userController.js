import User from "../models/userModel.js";
import asyncHandler from "express-async-handler";

const profile = asyncHandler( async (req,res) => {
    
    const user = await User.findById(req.user._id)

    if(user){
        res.json({
            _id:user._id,
            name:user.name,
            email:user.email,
            isAdmin:user.isAdmin,
        })
        
    }else{
        res.status(404)
        throw new Error({
            status:false,
            message:'User not found'
        })
    }
})

export {
    profile
}