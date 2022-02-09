import { TwitterApi } from 'twitter-api-v2';
import { getRandomRobTopMessage, getTokens, setTokens } from './db.js';
import { clientId, clientSecret } from './stuff.js';
import log from './log.js';

const auth = {
  codeVerifier: '',
  state: '',
  code: '',
  callbackURL: '',
};

const twitterClient = new TwitterApi({
  clientId,
  clientSecret,
});

export function getOauthUrl(callbackURL) {
  const { url, codeVerifier, state } = twitterClient.generateOAuth2AuthLink(callbackURL, {
    scope: ['tweet.read', 'tweet.write', 'users.read', 'offline.access'],
  });

  auth.codeVerifier = codeVerifier;
  auth.state = state;
  auth.callbackURL = callbackURL;

  return url;
}

export async function loginWithOauth(state, code) {
  const { client, accessToken, refreshToken } = await twitterClient.loginWithOAuth2({
    code,
    codeVerifier: auth.codeVerifier,
    redirectUri: auth.callbackURL,
  });

  if (auth.state !== state) return false;

  await setTokens({ accessToken, refreshToken });

  log('Logged in as', (await client.v2.me()).name);

  return true;
}

async function refreshTokens() {
  log('Refreshing tokens');

  const { refreshToken } = await getTokens();
  const { client, accessToken, refreshToken: newRefreshToken } = await twitterClient.refreshOAuth2Token(refreshToken);

  await setTokens({ accessToken, refreshToken: newRefreshToken });

  return client;
}

export async function tweet() {
  const client = await refreshTokens();

  const message = getRandomRobTopMessage();
  log('Posting a new tweet:', message);
  await client.v2.tweet(message);

  log('Tweet posted successfully!');
}
