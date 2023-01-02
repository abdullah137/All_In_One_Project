import express from 'express';
import { createUserHandler, deleteSessionHandler, getUserProfile, loginUserHandler, getUserSessionsHandler, forgetPassword, updateUserProfile, resetPassword } from '../controller/user.controller';
import requireUser from '../middleware/requireUser';
import validateResources from '../middleware/validateResource';
import { createUserSchema, loginUserSchema, forgetPasswordSchema, resetPasswordSchema } from '../schema/user.schema';

const router = express.Router();

// Register User
router.post('/users/signup', validateResources(createUserSchema), createUserHandler);

// Login User
router.post('/users/login', validateResources(loginUserSchema), loginUserHandler);

// Check User Profile
router.get('/users/profile', requireUser, getUserProfile);

// User Update Account
router.patch('/users/profile', requireUser, updateUserProfile);

// User Logout
router.delete('/users/logout', requireUser, deleteSessionHandler);

// User Forget Password
router.post('/users/forget-password', validateResources(forgetPasswordSchema), forgetPassword);

// Change user password
router.post('/users/reset-password/:linkId', validateResources(resetPasswordSchema), resetPassword);

// Get Sessions
router.get('/users/sessions', requireUser, getUserSessionsHandler);

export default router;
