import Joi from "joi";

export const createChannelDto = Joi.object().keys({
    title: Joi.string().required(),
    about: Joi.string().optional()
});

export const updateChannelDto = Joi.object().keys({
    channelId: Joi.string().required(),
    title: Joi.string(),
    username: Joi.string().min(1)
});

export const deleteChannelDto = Joi.object().keys({
    channelId: Joi.string().required()
});