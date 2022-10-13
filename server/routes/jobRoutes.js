import express from "express";
const router = express.Router()
import {protect} from '../middleware/authMiddleware.js'
import {createJob,getJobs,jobInfo} from '../controllers/jobController.js'

router.get('/list',protect,getJobs)
router.post('/create',protect,createJob)
router.get('/:id',protect,jobInfo)

export default router