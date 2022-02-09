import express from 'express';
import cron from 'node-cron';
import { getOauthUrl, loginWithOauth, tweet } from './twitter.js';
import log from './log.js';

const PORT = 5069;
const CALLBACK_URL = 'http://localhost:5069/cb';
const CRON_TIME = '0 * * * *';

const app = express();

cron.schedule(CRON_TIME, () => {
  log('Running cron');
  tweet();
});

app.get('/auth', (req, res) => {
  res.redirect(getOauthUrl(CALLBACK_URL));
});

app.get('/cb', async (req, res) => {
  const { state, code } = req.query;

  const success = await loginWithOauth(state, code);

  res.status(success ? 200 : 400).send(success ? 'Authorized successfully!' : 'Failed to authorize!');
});

app.listen(PORT, () => {
  log('Express listening on port', PORT.toString());
});
