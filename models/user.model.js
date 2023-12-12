const Joi = require('joi');
const jwt = require('jsonwebtoken');

function generateAuthToken(userId, user, expiry) {
  const token = jwt.sign(
    {
      id: userId,
      name: user.name,
      email: user.email,
      dob: user.dob,
      location: user.location,
      created_at: user.created_at,
      modified_at: user.modified_at,
    },
    process.env.JWT_PRIVATE_KEY,
    {
      expiresIn: expiry,
    }
  );
  return token;
}

function validateUser(user) {
  const userSchema = Joi.object({
    name: Joi.string().trim().min(1).max(255).required(),
    email: Joi.string().trim().email().max(255).required(),
    password: Joi.string().trim().max(50).required(),
    dob: Joi.string().trim().max(50).required(),
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
  });

  return userSchema.validate(user);
}

module.exports = { generateAuthToken, validateUser };
