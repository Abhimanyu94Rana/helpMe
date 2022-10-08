import express from 'express'
const router = express.Router()
import multer from "multer"
import path from "path"

let storage = multer.diskStorage({
    destination: (req,file,cb) => cb(null,'uploads/'),
    filename:(req,file,cb) => {
        const fileName = `${Date.now()}-${Math.round(Math.random()*1E9)}${path.extname(file.originalname)}`
        cb(null,fileName)
    }
})

let file = multer({storage}).single('file')

router.post('/upload', (req,res,err) => {
    file(req,res,function(err){
        if (err instanceof multer.MulterError) {
            return res.status(404).send({status:false,message:err})
        } else if (err) {
            return res.status(404).send({status:false,message:err})
        }
        return res.status(200).send({status:true,message:"File has been uploaded successfully.",data:req.file.filename})
    })
})

export default router