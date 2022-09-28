import express from 'express'
import dotenv from 'dotenv'
import connectDB from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import userRoutes from './routes/userRoutes.js'
import categoryRoutes from './routes/categoryRoutes.js'
import jobRoutes from './routes/jobRoutes.js'
import {notFound,errorHandler} from './middleware/errorMiddleware.js'

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

app.use(notFound)
app.use(errorHandler)

// Start the server
const PORT = process.env.PORT || 5000
app.listen(`${PORT}`,console.log(`Server is running on ${PORT}`))