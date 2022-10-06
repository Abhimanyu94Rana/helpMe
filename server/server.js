import express from 'express'
import dotenv from 'dotenv'
import connectDB from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import userRoutes from './routes/userRoutes.js'
import categoryRoutes from './routes/categoryRoutes.js'
import jobRoutes from './routes/jobRoutes.js'
import {notFound,errorHandler} from './middleware/errorMiddleware.js'
import {upload} from './utils/upload.js'
import fs from 'fs'

// Configure ENV
dotenv.config()

// Connect to mongoDB
connectDB()

const app = express()

// middleware
app.use(express.json())

app.get('/',(req,res) => {
    res.send('Api is running')
})

// Auth Routes
app.use('/api/auth',authRoutes)

// User Routes
app.use('/api/user',userRoutes)

// Category Routes
app.use('/api/category',categoryRoutes)

// Job Routes
app.use('/api/job',jobRoutes)

// Upload File Route
app.post("/api/file",upload.single('file'),(req,res)=>{
    let img = fs.readFileSync(req.file.path);
    let encodeImg = img.toString('base64');
    let finalImg = {
        contentType:req.file.mimetype,
        image:new Buffer(encodeImg,'base64')
    };
    imageModel.create(finalImg,function(err,result){
        if(err){
            console.log(err);
        }else{
            console.log(result.img.Buffer);
            console.log("Saved To database");
            res.contentType(finalImg.contentType);
            res.send(finalImg.image);
        }
    })
})

app.use(notFound)
app.use(errorHandler)

// Start the server
const PORT = process.env.PORT || 5000
app.listen(`${PORT}`,console.log(`Server is running on ${PORT}`))