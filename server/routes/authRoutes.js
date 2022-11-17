import express from "express";
import { login ,register,forgotPassword, reauth,returnStripe} from "../controllers/authController.js";
const router = express.Router()
import {check} from 'express-validator'

// Login
router.post('/login',
    [
        check('email').isEmail().withMessage('Please enter valid email.'),
        check('password')
            .not().isEmpty().withMessage('Please enter password.')
            .isLength({min:6}).withMessage('Password should be minimum characters of 6.')
    ],
    login
)

// Stripe Reauth
router.get('/:userId/:accountId/reauth',reauth)

// Stripe Return
router.get('/:userId/:accountId/return',returnStripe)

// Register
router.post('/register',
    [
        check('name').not().isEmpty().withMessage('Please enter valid email.'),
        check('email').isEmail().withMessage('Please enter valid email.'),
        check('profilePic').not().isEmpty().withMessage('Invalid profile picture.'),
        check('countryCode').not().isEmpty().withMessage('Invalid country code.'),        
        check('password')
            .not().isEmpty().withMessage('Please enter password.')
            .isLength({min:6}).withMessage('Password should be minimum characters of 6.')
            .custom((value,{req, loc, path}) => {
                if (value !== req.body.confirmPassword) {
                    throw new Error("Passwords don't match");
                } else {
                    return value;
                }
            }),
        check('phoneNumber')
            .isMobilePhone().withMessage('Please enter valid phone number')
            .isLength({min:10}).withMessage('Phone number should be minimum of 10 digits.')
    ],
    register
)

router.post('/forgot-password',forgotPassword)


export default router