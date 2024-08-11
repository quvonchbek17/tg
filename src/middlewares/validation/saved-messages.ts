import Joi from "joi";

export const savedMessageGetQueryDto = Joi.object().keys({
  limit: Joi.number().required(),
});

export const createSavedMessageDto = Joi.object().keys({
    message: Joi.string().required(),
});

export const updateSavedMessageDto = Joi.object().keys({
    messageId: Joi.number().required(),
    message: Joi.string().required(),
});

export const deleteSavedMessageDto = Joi.object().keys({
    messageId: Joi.number().required()
});