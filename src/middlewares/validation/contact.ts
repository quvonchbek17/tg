import Joi from "joi";

export const addContactDto = Joi.object().keys({
    username: Joi.string().optional(), // Username may be empty if phone is provided
    phone: Joi.string().pattern(/^\+\d{10,15}$/).optional(), // Phone number pattern
    firstName: Joi.string().optional(),
    lastName: Joi.string().optional(),
    addPhonePrivacyException: Joi.boolean().optional()
});