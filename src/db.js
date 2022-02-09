import mongoose from 'mongoose';
import { dbURI } from './stuff.js';
import { readFileSync } from 'fs';
import log from './log.js';

const tokenSchema = new mongoose.Schema({
  account: { type: String, required: true },
  accessToken: { type: String, required: true },
  refreshToken: { type: String, required: true },
});

const Token = mongoose.model('token', tokenSchema);

export const getTokens = async () => await Token.findOne({ account: 'main' });

export const setTokens = async ({ accessToken, refreshToken }) => {
  const tokenExists = await Token.exists({ account: 'main' });

  if (tokenExists) {
    await Token.findOneAndUpdate({ account: 'main' }, { accessToken, refreshToken });
  } else {
    const token = new Token({ account: 'main', accessToken, refreshToken });
    await token.save();
  }
};

export const getRandomRobTopMessage = () => {
  const messages = JSON.parse(readFileSync('./db/messages.json'));

  return messages[Math.floor(Math.random() * messages.length)];
};

try {
  await mongoose.connect(dbURI);
  log('Connected to the database');
} catch (error) {
  log("Couldn't connect to the database:", error);
}
