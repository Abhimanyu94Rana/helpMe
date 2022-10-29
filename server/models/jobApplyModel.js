import mongoose from "mongoose";

const jobApplySchema = mongoose.Schema({
    job: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Job',
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    isHired:{
        type:Boolean,
        default:false
    }
},{timestamps:true})

const JobApply = mongoose.model('JobApply',jobApplySchema)
export default JobApply