import express from 'express'
const router = express.Router()
import {protect} from '../middleware/authMiddleware.js'
import {profile,updateProfile} from '../controllers/userController.js'

router.get('/profile',protect,profile)
router.post('/profile',protect,updateProfile)

export default router