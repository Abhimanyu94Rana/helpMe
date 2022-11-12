import express from "express";
const router = express.Router()
import {protect} from '../middleware/authMiddleware.js'
import {createJob,getJobs,jobInfo,jobApplicants,hire, endJob, success, failure} from '../controllers/creator/jobController.js'
import {applyJob, startJob} from '../controllers/needer/jobController.js'
import { payment } from "../controllers/paymentController.js";

router.get('/list',protect,getJobs)
router.post('/create',protect,createJob)
router.get('/success/:id',success)
router.get('/failure/:id',failure)
router.get('/info/:id',protect,jobInfo)
router.get('/applicants',protect,jobApplicants)
router.post('/hire/:id',protect,hire)
router.post('/end/:id',protect,endJob)
router.post('/:id/payment',protect,payment)

// Needer
router.post('/apply/:id',protect,applyJob)
router.post('/start/:id',protect,startJob)


export default router