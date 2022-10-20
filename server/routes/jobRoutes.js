import express from "express";
const router = express.Router()
import {protect} from '../middleware/authMiddleware.js'
import {createJob,getJobs,jobInfo} from '../controllers/jobController.js'
import { payment } from "../controllers/paymentController.js";

router.get('/list',protect,getJobs)
router.post('/create',protect,createJob)
router.get('/:id',protect,jobInfo)
router.post('/:id/payment',protect,payment)


export default router