import Joi from "joi";

export const addContactDto = Joi.object().keys({
    username: Joi.string().optional(), // Username may be empty if phone is provided
    phone: Joi.string().pattern(/^\+\d{10,15}$/).optional(), // Phone number pattern
    firstName: Joi.string().optional(),
    lastName: Joi.string().optional(),
    addPhonePrivacyException: Joi.boolean().optional()
});

export const blockUserOrContactDto = Joi.object().keys({
    userId: Joi.string().required()
});

export const getBlockContactsDto = Joi.object().keys({
    limit: Joi.number().required(),
    page: Joi.number().required()
});

export const getContactInfoByPhoneDto = Joi.object().keys({
    phone: Joi.string().pattern(/^\+\d{10,15}$/).required()
});

export const getContactInfoByUsernameDto = Joi.object().keys({
    username: Joi.string().required()
});


export const searchContactDto = Joi.object().keys({
    limit: Joi.number().optional(),
    search: Joi.string().required()
});

export const deleteContacts = Joi.object().keys({
    userIds: Joi.array().items(Joi.string().required()).required()
});

export const editContactDto = Joi.object().keys({
    userId: Joi.string().required(),
    phone: Joi.string().pattern(/^\+\d{10,15}$/).optional(),
    firstName: Joi.string().optional(),
    lastName: Joi.string().optional(),
    addPhonePrivacyException: Joi.boolean().optional()
});