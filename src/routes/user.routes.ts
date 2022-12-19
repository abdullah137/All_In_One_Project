import express from 'express';
import { createUserHandler, deleteSessionHandler, loginUserHandler } from '../controller/user.controller';
import requireUser from '../middleware/requireUser';
import validateResources from '../middleware/validateResource';
import { createUserSchema, loginUserSchema } from '../schema/user.schema';

const router = express.Router();

// Register User
router.post('/users/signup', validateResources(createUserSchema), createUserHandler);

// Login User
router.post('/users/login', validateResources(loginUserSchema), loginUserHandler);

// Check User Profile

// User Update Account

// User Logout
router.delete('/users/logout', requireUser, deleteSessionHandler);

export default router;
