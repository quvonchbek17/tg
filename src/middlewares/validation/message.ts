import Joi from "joi";

export const sendMessageDto = Joi.object().keys({
    chatId: Joi.string().required(),
    text: Joi.string().required()
});

export const editMessageDto = Joi.object().keys({
    chatId: Joi.string().required(),
    messageId: Joi.number().required(),
    text: Joi.string().required()
});

export const searchDto = Joi.object().keys({
    peerId: Joi.string().required(),
    search: Joi.string().required(),
    limit: Joi.number().required(),
    fromId: Joi.string().optional(),
    minDate: Joi.number().optional(),
    maxDate: Joi.number().optional()
});

export const searchGlobalDto = Joi.object().keys({
    search: Joi.string().required(),
    limit: Joi.number().required(),
    minDate: Joi.number().optional(),
    maxDate: Joi.number().optional()
});

export const sendReactionDto = Joi.object().keys({
    peerId: Joi.string().required(),
    msgId: Joi.number().required(),
    reaction: Joi.string().required(),
    big: Joi.boolean().optional()
});

export const setTypingChatDto = Joi.object().keys({
    chatId: Joi.string().required()
});

export const getProfilePhotosDto = Joi.object().keys({
    peerId: Joi.string().required(),
    limit: Joi.number().required()
});

export const setMessagesTtlDto = Joi.object().keys({
    peerId: Joi.string().required(),
    ttl: Joi.number().required()
});
