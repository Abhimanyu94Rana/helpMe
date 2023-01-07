import express from 'express'
import dotenv from 'dotenv'
import connectDB from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import userRoutes from './routes/userRoutes.js'
import categoryRoutes from './routes/categoryRoutes.js'
import jobRoutes from './routes/jobRoutes.js'
import fileRoutes from './routes/fileRoutes.js'
import {notFound,errorHandler} from './middleware/errorMiddleware.js'
import path from "path"
import { fileURLToPath } from 'url';
import {Server} from "socket.io"
import cors from "cors";


import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import swaggerUi from 'swagger-ui-express' 
const swaggerFile = require('./swagger_output.json');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Configure ENV
dotenv.config()

// Connect to mongoDB
connectDB()

const app = express()
app.use(cors());

// middleware
app.use(express.json())

app.get('/status',(req,res) => {
    res.send('HelpMe is ready to provide its service.')
})

// Swagger Doc Route
app.use('/apis', swaggerUi.serve, swaggerUi.setup(swaggerFile))

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Auth Routes
app.use('/api/auth',authRoutes)

// User Routes
app.use('/api/user',userRoutes)

// Category Routes
app.use('/api/category',categoryRoutes)

// Job Routes
app.use('/api/job',jobRoutes)

// Upload File Route
app.use('/api/file',fileRoutes)

app.use(notFound)
app.use(errorHandler)

// Start the server
const PORT = process.env.PORT || 3000
const server = app.listen(`${PORT}`,console.log(`Server is running on ${PORT}`))

// Socket
const io = new Server(server,{
    cors:{origin: 'https://www.piesocket.com'}
})

io.on('connection',(socket)=>{
    
    // socket.emit('welcome','How can helpme help you ?');
    socket.on('location',(data)=>{
        console.log(data);
        socket.broadcast.emit('receive',{location:data})
    });
})