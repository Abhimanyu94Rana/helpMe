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

// Socket
import http from 'http'
import {Server} from "socket.io"

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

// Create server for socket
const server = http.createServer(app)

// middleware
app.use(express.json())

app.get('/',(req,res) => {
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
const PORT = process.env.PORT || 5000
server.listen(`${PORT}`,console.log(`Server is running on ${PORT}`))

// Socket
// const io = require('socket.io')(http)
 
const io = new Server(server,{
    cors:{
        origin:"http://localhost:3000",
        methods:["GET","POST"]
    }
})

io.on('connection',(socket)=>{
    console.log('Connected....');
    socket.on('send',(data)=>{
        console.log(data);
    })
})