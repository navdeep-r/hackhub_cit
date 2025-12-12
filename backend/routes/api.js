import { Router } from 'express';
import hackathons from './hackathons.js';
import auth from './auth.js';
import profile from './profile.js';
import registrations from './registration.js';
import analytics from './analytics.js';
import users from './users.js';
import extension_webhook from './extension-webhook.js';

const api = Router();

api.use('/hackathons', hackathons);
api.use('/auth', auth);
api.use('/profile', profile);
api.use('/registrations', registrations);
api.use('/analytics', analytics);
api.use('/users', users);
api.use('/extension-webhook', extension_webhook);

export default api;