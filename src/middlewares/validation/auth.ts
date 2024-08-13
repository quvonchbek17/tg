import Joi from "joi";

export const sendCodeDto = Joi.object().keys({
    phoneNumber: Joi.string().pattern(/^\+\d{10,15}$/).optional(),
});

export const verifyCodeDto = Joi.object().keys({
    phoneNumber: Joi.string().pattern(/^\+\d{10,15}$/).optional(),
    code: Joi.string().required(),
    phoneCodeHash: Joi.string().required()
});