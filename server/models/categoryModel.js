import mongoose from "mongoose";

const categorySchema = mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true
    },
    smallImage:{
        type:String,
        required:false
    },
    mediumImage:{
        type:String,
        required:false
    },
    largeImage:{
        type:String,
        required:false
    }
},{timestamps:true})

const Category = mongoose.model('Category',categorySchema)
export default Category