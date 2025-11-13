import { Router } from 'express';
import { login } from './Auth.controller';

const router = Router();

router.post('/login', login);

export default router;