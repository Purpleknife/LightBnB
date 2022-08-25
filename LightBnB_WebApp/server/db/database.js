const properties = require('../json/properties.json');
const users = require('../json/users.json');
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

// * Get all reservations for a single user.

const getAllReservations = (guest_id, limit = 10) => {
  return pool.query(
    `SELECT reservations.*, properties.*, AVG(property_reviews.rating) AS average_rating
    FROM properties
    JOIN reservations ON properties.id = reservations.property_id
    JOIN property_reviews ON properties.id = property_reviews.property_id
    WHERE reservations.guest_id = $1
    GROUP BY reservations.id, properties.id
    ORDER BY start_date
    LIMIT $2;`,
    [guest_id, limit])
  .then((result) => {
    console.log('Get reservations', result.rows);
    return result.rows;
  })
  .catch((err) => {
    console.log(err.message);
  })
};
exports.getAllReservations = getAllReservations;


/// Properties

// * Get all properties.

const getAllProperties = (options, limit) => {
  const queryParams = [];
 
  let queryString = `
  SELECT properties.*, AVG(property_reviews.rating) as average_rating
  FROM properties
  JOIN property_reviews ON properties.id = property_id
  `;

  // Add to the query depending on what's passed in 'options'.
  if (options.city) {
    queryParams.push(`%${options.city}%`);
    queryString += `WHERE city LIKE $${queryParams.length} `;
  }

  if (options.owner_id) {
    queryParams.push(Number(options.owner_id));
    queryString += (queryParams.length > 1) ? `AND` : `WHERE`;
    queryString += ` owner_id = $${queryParams.length} `;
  }
  
  if (options.minimum_price_per_night) {
    queryParams.push(Number(options.minimum_price_per_night) * 100); // *100 because the cost is stored in cents, not in dollars, in the database.
    queryString += (queryParams.length > 1) ? `AND` : `WHERE`;
    queryString += ` cost_per_night >= $${queryParams.length} `;
  }

  if (options.maximum_price_per_night) {
    queryParams.push(Number(options.maximum_price_per_night) * 100);
    queryString += (queryParams.length > 1) ? `AND` : `WHERE`;
    queryString += ` cost_per_night <= $${queryParams.length} `;
  }

  queryString += `GROUP BY properties.id `

  if (options.minimum_rating) {
    queryParams.push(Number(options.minimum_rating));
    queryString += `HAVING AVG(property_reviews.rating) >= $${queryParams.length} `;
  }
  
  queryParams.push(limit = 10); //When 10 is passed in the function, it becomes 20 (?) So I put the 10 here to fix it.
  queryString += `
  ORDER BY cost_per_night
  LIMIT $${queryParams.length};
  `;

  console.log(queryString, queryParams);
  
  return pool.query(queryString, queryParams)
  .then((res) => res.rows)
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

const addProperty = (property) => {
  return pool.query(
    `INSERT INTO properties (owner_id, title, description, thumbnail_photo_url, cover_photo_url, cost_per_night, parking_spaces, number_of_bathrooms, number_of_bedrooms, country, street, city, province, post_code)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    RETURNING *;`,
    [property.owner_id, property.title, property.description, property.thumbnail_photo_url, property.cover_photo_url, property.cost_per_night, property.parking_spaces, property.number_of_bathrooms, property.number_of_bedrooms, property.country, property.street, property.city, property.province, property.post_code])
  .then((result) => {
    console.log('Add property', result.rows[0]);
    return result.rows[0];
  })
  .catch((err) => {
    console.log(err.message);
  })
};

exports.addProperty = addProperty;

const makeAReservation = (reservation) => {
  return pool.query(
    `INSERT INTO reservations (start_date, end_date, property_id, guest_id)
    VALUES ($1, $2, $3, $4)
    RETURNING *;`,
    [reservation.start_date, reservation.end_date, reservation.property_id, reservation.guest_id])
  .then((result) => {
    console.log('Add reservation ===>', result.rows[0]);
    return result.rows[0];
  })
  .catch((err) => {
    console.log(err.message);
  })
}

exports.makeAReservation = makeAReservation;
