// Defines the definition of app endpoints

const redisClient = require('../utils/redis');
const dbClient = require('../utils/db');

module.exports = {
  /**
 * Checks if the Redis and DB connection is active.
 * @param {import('express').Request} req the received http request
 * @param {import('express').Response} res the sent http response
 */
  getStatus: (req, res) => {
    const redisStatus = redisClient.isAlive();
    const dbStatus = dbClient.isAlive();

    return res.status(200).json({ redis: redisStatus, db: dbStatus });
  },

  /**
 * Returns the number of users and files in the DB.
 * @param {import('express').Request} req the received http request
 * @param {import('express').Response} res the sent http response
 */
  getStats: (req, res) => {
    (async () => {
      const nbUsers = await dbClient.nbUsers();
      const nbFiles = await dbClient.nbFiles();

      return res.status(200).json({ users: nbUsers, files: nbFiles });
    })();
  },
};
