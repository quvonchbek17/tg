import Joi from "joi";

export const getMessagesQueryDto = Joi.object().keys({
    chatId: Joi.string().required()
});

export const sendMessageDto = Joi.object().keys({
    chatId: Joi.string().required(),
    text: Joi.string().required()
});

export const editMessageDto = Joi.object().keys({
    chatId: Joi.string().required(),
    messageId: Joi.number().required(),
    text: Joi.string().required()
});

export const deleteMessageDto = Joi.object().keys({
    chatId: Joi.string().required(),
    messageId: Joi.number().required()
});
