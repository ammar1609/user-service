const axios = require('axios');
const httpStatus = require('http-status-codes').StatusCodes;

const sendResetPasswordNotification = async (userData, temporaryPassword) => {
  try {
    const response = await axios.post(
      `${process.env.NOTIFICATION_SERVICE_URL}/resetPassword`,
      { user: userData, generatedPassword: temporaryPassword }
    );

    if (response.status == httpStatus.OK) {
      console.log(response.data.message);
      return {
        message:
          'Password has been reset successfully! Check your email for the temporary password.',
      };
    } else if (response.status == httpStatus.ACCEPTED) {
      console.log(response.data.message);
      return { message: 'Notifications are disabled' };
    } else {
      console.error('Error sending notification:', response.data.error);
      throw new Error('Error sending notification');
    }
  } catch (error) {
    console.error('Error sending notification:', error.message);
    throw new Error('Error sending notification');
  }
};

module.exports = sendResetPasswordNotification;
