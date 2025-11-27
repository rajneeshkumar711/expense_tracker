import { Router } from 'express';
import { login, register, getCurrentUser } from '../controllers/authController';
import { loginValidator, registerValidator } from '../validators/authValidators';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/login', loginValidator, login);
router.post('/register', registerValidator, register);
router.get('/me', authenticate, getCurrentUser);

export default router;
