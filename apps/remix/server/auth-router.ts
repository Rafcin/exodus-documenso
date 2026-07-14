import { auth } from '@documenso/auth/server';
import { Hono } from 'hono';

const authServer = new Hono().route('/api/auth', auth);

export default authServer;
