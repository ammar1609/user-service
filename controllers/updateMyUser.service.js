const httpStatus = require('http-status-codes').StatusCodes;
const { db, FieldValue } = require('../startup/firebase');
const reverseGeocodeWithOpenStreetMap = require('../helpers/location');

const updateMyUser = async (req, res) => {
  const userRef = db.collection(process.env.USERS_DOC).doc(req.user.id);
  const userDoc = await userRef.get();

  if (!userDoc.exists) {
    console.warn('User not found');
    return res.status(httpStatus.NOT_FOUND).json({ error: 'User not found' });
  }

  if (req.body.location) {
    console.warn(
      `Location attribute cannot be updated directly. To update the location, please provide the coordinates`
    );
    return res.status(httpStatus.BAD_REQUEST).json({
      error:
        'Location attribute cannot be updated directly. To update the location, please provide the coordinates',
    });
  }

  if (req.body.latitude !== undefined || req.body.longitude !== undefined) {
    const response = await reverseGeocodeWithOpenStreetMap(latitude, longitude);

    if (
      response.error ||
      (response.address.city != process.env.ALLOWED_CITY &&
        response.address.country != process.env.ALLOWED_COUNTRY)
    ) {
      console.warn(`Users in Leipzig, Germany are allowed to register`);
      return res
        .status(httpStatus.BAD_REQUEST)
        .json({ error: 'Users in Leipzig, Germany are allowed to register' });
    }
  }

  const now = FieldValue.serverTimestamp();

  await userRef.update({
    ...req.body,
    modified_at: now,
  });

  const updatedUserDoc = await userRef.get();
  const updatedUserData = updatedUserDoc.data();

  const updatedUser = {
    id: updatedUserData.id,
    name: updatedUserData.name,
    email: updatedUserData.email,
    dob: updatedUserData.dob,
    location: updatedUserData.location,
  };

  res
    .status(httpStatus.OK)
    .json({ message: 'User updated successfully', user: updatedUser });
};

module.exports = updateMyUser;
