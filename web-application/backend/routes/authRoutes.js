import express from 'express';
import passport from 'passport';
import isUserAuthenticated from '../middleware/auth.js';
import { logout, getCurrentUser } from '../controllers/authController.js';

const router = express.Router();

const errorUrl = 'http://localhost:3005/login/error';
const successUrl = 'http://localhost:3005/myProjects?from_login=true';

router.get(
	'/login',
	passport.authenticate('github', { scope: ['user:email', 'repo'] })
);

router.get(
	'/github/callback',
	passport.authenticate('github', {
		failureRedirect: errorUrl,
		successRedirect: successUrl,
	})
);

router.get('/user', isUserAuthenticated, getCurrentUser);
router.post('/logout', logout);

export default router;
