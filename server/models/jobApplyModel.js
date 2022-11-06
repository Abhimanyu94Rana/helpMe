import mongoose from "mongoose";

const jobApplySchema = mongoose.Schema({
    job: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Job',
    },
    jobOwner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    isHired:{
        type:Boolean,
        default:false
    },
    status:{
        type:Number, // 0:not_started,1:started,2:ended
        default:0
    },
    startTime:{
        type:Date,
        default:null
    },
    endTime:{
        type:Date,
        default:null
    }
},{timestamps:true})

const JobApply = mongoose.model('JobApply',jobApplySchema)
export default JobApply