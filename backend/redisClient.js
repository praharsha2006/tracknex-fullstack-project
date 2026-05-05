const { createClient } = require('redis');

const redisUrl = process.env.REDIS_URL;
const redisHost = process.env.REDIS_HOST;
const redisPort = Number(process.env.REDIS_PORT || 6379);
const redisUsername = process.env.REDIS_USERNAME;
const redisPassword = process.env.REDIS_PASSWORD;

const redisConfigPresent = Boolean(redisUrl || redisHost);

let rawClient = null;
let isRedisReady = false;

if (redisConfigPresent) {
  const options = redisUrl
    ? { url: redisUrl }
    : {
        socket: {
          host: redisHost,
          port: redisPort
        },
        username: redisUsername,
        password: redisPassword
      };

  rawClient = createClient(options);

  rawClient.on('error', (err) => {
    console.log('Redis Client Error', err.message || err);
  });

  rawClient
    .connect()
    .then(() => {
      isRedisReady = true;
      console.log('Redis connected');
    })
    .catch((err) => {
      console.log('Redis disabled (connection failed):', err.message || err);
      isRedisReady = false;
    });
} else {
  console.log('Redis disabled (no REDIS_URL or REDIS_HOST configured)');
}

const client = {
  async get(key) {
    if (!isRedisReady || !rawClient) return null;
    try {
      return await rawClient.get(key);
    } catch {
      return null;
    }
  },
  async set(key, value, options) {
    if (!isRedisReady || !rawClient) return null;
    try {
      return await rawClient.set(key, value, options);
    } catch {
      return null;
    }
  },
  async del(key) {
    if (!isRedisReady || !rawClient) return 0;
    try {
      return await rawClient.del(key);
    } catch {
      return 0;
    }
  }
};

module.exports = client;
