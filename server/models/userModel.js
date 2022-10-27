import mongoose from "mongoose";
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

const userSchema = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    profilePic:{
        type:String,
        required:true
    },
    countryCode:{
        type:String,
        required:true
    },
    bankInfo:{
        accountName:{
            type:String
        },
        accountNumber:{
            type:Number
        },
        ifscNumber:{
            type:String
        },
        adharCardFront:{
            type:String
        },
        adharCardBack:{
            type:String
        },
        panCard:{
            type:String
        },
        socialId:{
            type:String
        }
    },
    categories: [{
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'Category',
    }],
    isAdmin:{
        type:Boolean,
        required:true,
        default:false
    },
    resetPasswordToken: {
        type: String,
        required: false
    },
    resetPasswordExpires: {
        type: Date,
        required: false
    },
    step:{
        type:Number
    },
    type:{
        type:Number
    }
},{timestamps:true})


userSchema.methods.matchPassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword,this.password)
}

userSchema.methods.generatePasswordReset = function() {
    this.resetPasswordToken = crypto.randomBytes(20).toString('hex');
    this.resetPasswordExpires = Date.now() + 3600000; //expires in an hour
}

userSchema.pre('save', async function(next){
    if(!this.isModified('password')){
        next()
    }

    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password,salt)
})


const User = mongoose.model('User',userSchema)
export default User