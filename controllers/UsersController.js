// Handles functionality with users.
const sha1 = require('sha1');
const { ObjectId } = require('mongodb/lib/core/index').BSON;
const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');

/**
 * Returns the number of users and files in the DB.
 * @param {import('express').Request} req the received http request
 * @param {import('express').Response} res the sent http response
 */
async function postNew(req, res) {
  const email = req.body.email || '';
  const pwd = req.body.password || '';
  // basic arg validation
  if (!email) {
    return res.status(400).json({ error: 'Missing email' });
  }
  if (!pwd) {
    return res.status(400).json({ error: 'Missing password' });
  }

  let user;
  try {
    user = await dbClient.findUser('email', email);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Problem while checking user existence' });
  }

  if (user) {
    return res.status(400).json({ error: 'Already exists' });
  }

  let hashedPwd;
  try {
    hashedPwd = sha1(pwd);

    if (!hashedPwd) {
      throw Error('Undefined hashed password');
    }
  } catch (error) {
    console.error(error); // for dev
    return res.status(500).json({ error: 'Error securing password' }); // for user
  }

  let result;
  try {
    result = await dbClient.db.collection('users').insertOne({ email, password: hashedPwd });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error creating new user' }); // for user
  }

  return res.status(201).json({ email, id: result.insertedId });
}

/**
 * Gives the user's email and id information.
 * Requires a token for authentication.
 * @param {import('express').Request} req the received http request
 * @param {import('express').Response} res the sent http response
 */
async function getMe(req, res) {
  const token = req.header('X-Token') || '';
  const key = `auth_${token}`;

  let userId;
  let user;
  try {
    userId = await redisClient.get(key);
    user = await dbClient.findUser('_id', ObjectId(userId));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error finding user.' });
  }

  if (!userId || !user) { // unauthorized/false token
    return res.status(401).json({ error: 'Unauthorized' });
  }

  return res.json({ id: user._id, email: user.email });
}

module.exports = {
  postNew,
  getMe,
};
