const httpStatus = require('http-status-codes').StatusCodes;

const authenticateToken = async (req, res) => {
  res.status(httpStatus.OK).json({ valid: true, user: req.user });
};

module.exports = authenticateToken;
