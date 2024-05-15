// Handles authentication and authorization of the api.
const sha1 = require('sha1');
const uuid = require('uuid');
const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');

class AuthController {
  /**
   * Sign-in the user by generating a new authentication token.
   * @param {import('express').Request} req the received http request
   * @param {import('express').Response} res the sent http response
   */
  static async getConnect(req, res) {
    const basicAuth = req.headers.authorization || '';
    let email;
    let pwd;

    // Parse the authorization header value, as needed.
    try {
      const utf8Str = Buffer.from(basicAuth.split('Basic ')[1], 'base64').toString('utf8');
      [email, pwd] = utf8Str.split(':');

      if (!email || !pwd) {
        return res.status(400).json({ error: 'Incorrect email/password base64 format' });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Server error while signing in. Apologies!' });
    }

    const hashedPwd = sha1(pwd);
    // const utf8Str = b64.toString('utf-8');
    // console.log(utf8Str);
    const user = await dbClient.findUser('email', email);
    if (!user || user.password !== hashedPwd) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = user._id;
    let token;
    try {
      token = uuid.v4();
      const key = `auth_${token}`;

      await redisClient.set(key, userId.toString(), 60 * 60 * 24);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error while connecting.' });
    }

    return res.status(200).json({ token });
  }

  /**
   * Sign-out the user based on the authentication token.
   * @param {import('express').Request} req the received http request
   * @param {import('express').Response} res the sent http response
   */
  static async getDisconnect(req, res) {
    const token = req.header('X-Token') || '';
    const key = `auth_${token}`;

    try {
      const userId = await redisClient.get(key);

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized ' });
      }

      redisClient.del(key);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error finding token' });
    }

    return res.status(204).end();
  }
}

module.exports = AuthController;
