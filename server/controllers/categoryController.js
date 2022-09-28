import asyncHandler from "express-async-handler"
import Category from "../models/categoryModel.js"

const getCategories =  asyncHandler( async(req,res) => {
    const categories = await Category.find({})
    if(categories){
        res.status(200)
        res.json({
            status:true,
            data:categories
        })
    }else{
        res.status(404)
        return res.send({
            status:false,
            message:"No categories found."
        })
    }
})

export {
    getCategories
}