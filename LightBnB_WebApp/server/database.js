const properties = require('./json/properties.json');
const users = require('./json/users.json');
const { Pool } = require('pg');

const pool = new Pool({
  user: 'labber',
  password: 'labber',
  host: 'localhost',
  port: 5432,
  database: 'lightbnb'
});



/// Users

// * Get a single user from the database given their email.

const getUserWithEmail = (email) => {
  return pool.query(
    `SELECT * FROM users
    WHERE email = $1;`,
    [email])
  .then((result) => {
    console.log('Login', result.rows[0]);
    return result.rows[0];
  })
  .catch((err) => {
    console.log(err.message);
  })
};

exports.getUserWithEmail = getUserWithEmail;


// * Get a single user from the database given their id.

const getUserWithId = (id) => {
  return pool.query(
    `SELECT * FROM users
    WHERE id = $1;`,
    [id])
  .then((result) => {
    console.log('LoginID', result.rows[0]);
    return result.rows[0];
  })
  .catch((err) => {
    console.log(err.message);
  })
};
exports.getUserWithId = getUserWithId;



// * Add a new user to the database.

const addUser = (user) => {
  return pool.query(
    `INSERT INTO users (name, email, password)
    VALUES ($1, $2, $3)
    RETURNING *;`,
    [user.name, user.email, user.password])
  .then((result) => {
    console.log('Add user', result.rows[0]);
    return result.rows[0];
  })
  .catch((err) => {
    console.log(err.message);
  })
};

exports.addUser = addUser;


/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function(guest_id, limit = 10) {
  return getAllProperties(null, 2);
}
exports.getAllReservations = getAllReservations;


/// Properties

// * Get all properties.

const getAllProperties = (options, limit = 10) => {
  return pool.query(
    `SELECT * FROM properties
    LIMIT $1;`,
    [limit])
  .then((result) => {
    //console.log(result.rows);
    return result.rows;
  })
  .catch((err) => {
    console.log(err.message);
  })
};

exports.getAllProperties = getAllProperties;


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {
  const propertyId = Object.keys(properties).length + 1;
  property.id = propertyId;
  properties[propertyId] = property;
  return Promise.resolve(property);
}
exports.addProperty = addProperty;
