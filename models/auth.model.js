const Joi = require('joi');

const Auth = {
    validateAuth: (user) => {
        const authSchema = Joi.object({
            email: Joi.string().max(255).required(),
            password: Joi.string().max(50).required(),
        });

        return authSchema.validate(user);
    },
};

module.exports = Auth;