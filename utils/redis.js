// Handles the Redis Client connection
const redis = require('redis');

class RedisClient {
  constructor() {
    this.client = redis.createClient()
      .on('error', (err) => console.error(err));
    // .on('connect', () => console.log('Successful connection to Redis.'));
  }

  /**
   * Checks the connection with redis.
   * @returns true if successful, otherwise false.
   */
  isAlive() {
    return this.client.connected;
  }

  /**
   * Returns the Redis value associated with the given key.
   * @param {String} key the unique identifier of a value.
   */
  async get(key) {
    return new Promise((resolve, reject) => {
      this.client.get(key, (err, reply) => {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          resolve(reply);
        }
      });
    });
  }

  /**
   * Sets a new key/value pair in redis with an expiration time.
   *
   * @param {String} key the unique indentifier of a value.
   * @param {String} value the value belonging to the key.
   * @param {Number} duration the expiration time of the key/value pair, in seconds.
   */
  async set(key, value, duration) {
    return new Promise((resolve, reject) => {
      this.client.setex(key, duration, value, (err, reply) => {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          resolve(reply);
        }
      });
    });
  }

  /**
   * Removes the value of the specified key in redis.
   * @param {String} key the unique indentifier of a value.
   */
  async del(key) {
    return new Promise((resolve, reject) => {
      this.client.del(key, (err, reply) => {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          resolve(reply);
        }
      });
    });
  }
}

const redisClient = new RedisClient();
module.exports = redisClient;
