import express from 'express';
import { registerCompanyAndAdmin } from '../controllers/companyController.js';

const router = express.Router();

// Route for SuperAdmin to register company and admin
router.post('/register', registerCompanyAndAdmin);

export default router;