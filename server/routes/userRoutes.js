import express from 'express'
const router = express.Router()
import {profile} from '../controllers/userController.js'
import {protect} from '../middleware/authMiddleware.js'

router.get('/profile',protect,profile)

export default router