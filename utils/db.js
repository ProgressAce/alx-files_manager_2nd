// Handles the database connection.
import MongoClient from 'mongodb/lib/mongo_client';

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || '27017';
    const database = process.env.DB_DATABASE || 'files_manager';
    const url = `mongodb://${host}:${port}`;

    MongoClient.connect(url, { useUnifiedTopology: true })
      .then((client) => {
        this.db = client.db(database);
      })
      .catch((err) => console.error(err));
  }

  /**
   * Checks if the client is connected.
   * @returns true if successful, otherwise false.
   */
  isAlive() {
    const connected = this.db !== undefined;
    return connected;
  }

  /**
   * Returns the number of documents in the `users` collection.
   */
  async nbUsers() {
    return this.db.collection('users').countDocuments();
  }

  /**
   * Returns the number of documents in the `files` collection.
   */
  async nbFiles() {
    return this.db.collection('files').countDocuments();
  }

  /**
   * Finds one user in the `users` collection of the DB.
   * @param {String} fieldName unique identifier's representation in the DB.
   * @param {String} fieldValue unique identifier's value in the DB.
   * @returns the user if found, otherwise `undefined`
   */
  findUser(fieldName = 'email', fieldValue) {
    return new Promise((resolve, reject) => {
      const id = {};
      id[fieldName] = fieldValue;

      try {
        const user = this.db.collection('users').findOne(id);
        resolve(user);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Finds one file in the `files` collection of the DB.
   * @param {String} fieldName unique identifier's representation in the DB.
   * @param {String} fieldValue unique identifier's value in the DB.
   * @returns the user if found, otherwise `undefined`
   */
  findFile(fieldName, fieldValue) {
    return new Promise((resolve, reject) => {
      const id = {};
      id[fieldName] = fieldValue;

      try {
        const file = this.db.collection('files').findOne(id);
        resolve(file);
      } catch (error) {
        reject(error);
      }
    });
  }
}

const dbClient = new DBClient();
module.exports = dbClient;
