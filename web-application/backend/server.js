import express from 'express';
import dotenv from 'dotenv';
import repositoryRoutes from './routes/repositoryRoutes.js';
import pullRequestRoutes from './routes/pullRequestRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import collaboratorRoutes from './routes/collaboratorsRoutes.js';
import impactRoutes from './routes/impactRoutes.js';
import analysisRoutes from './routes/analysisRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import connectToDB from './config/databaseConfig.js';
import authRoutes from './routes/authRoutes.js';
import passport from 'passport';
import cookieSession from 'cookie-session';
import cors from 'cors';
import bodyParser from 'body-parser';
import './config/passportConfig.js';

dotenv.config();
connectToDB();

const app = express();
app.use(express.json());
app.use(bodyParser.json());
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));

app.get('/', (req, res) => {
	res.send('API is running....');
});

app.use(
	cookieSession({
		maxAge: 24 * 60 * 60 * 1000, // 1d
		keys: [process.env.COOKIE_KEY],
	})
);
app.use(passport.initialize());
app.use(passport.session());

app.use('/api/auth', authRoutes);
app.use('/api/repositories', repositoryRoutes);
app.use('/api/repositories/:repoID/pullRequests', pullRequestRoutes);
app.use('/api/impact/repositories/:repoID/pullRequests/:prNumber', impactRoutes)
app.use('/api/settings', settingsRoutes);
app.use('/api/collaborators/:repoID', collaboratorRoutes);
app.use('/api/analysis', analysisRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 6002;
app.listen(PORT, console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`));
