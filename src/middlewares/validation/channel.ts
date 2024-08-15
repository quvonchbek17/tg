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

export const getBlockedChannelUsersDto = Joi.object().keys({
    channelId: Joi.string().required(),
    page: Joi.number(),
    limit: Joi.number()
});

export const getChannelUsersDto = Joi.object().keys({
    channelId: Joi.string().required(),
    page: Joi.number(),
    limit: Joi.number()
});

export const getChannelMessagesDto = Joi.object().keys({
    channelId: Joi.string().required(),
    page: Joi.number(),
    limit: Joi.number()
});


export const addUserChannelDto = Joi.object().keys({
    channelId: Joi.string().required(),
    userIds: Joi.array().items(Joi.number().integer().min(1)).required()
});

export const blockChannelUserDto = Joi.object().keys({
    channelId: Joi.string().required(),
    userId: Joi.number().required()
});

export const checkUsernameDto = Joi.object().keys({
    channelId: Joi.string().required(),
    username: Joi.string().required()
});

export const updateChannelPhotoDto = Joi.object().keys({
    channelId: Joi.string().optional(),
    file: Joi.object({
      originalname: Joi.string().required(),
      mimetype: Joi.string().required(),
      buffer: Joi.binary().required(),
    }).optional(),
});

export const deleteChannelHistoryDto = Joi.object().keys({
    channelId: Joi.string().required(),
    forEveryone: Joi.boolean().required()
});

export const getChannelInfoDto = Joi.object().keys({
    channelId: Joi.string().required()
});

export const setChannelDiscussionGroupDto = Joi.object().keys({
    channelId: Joi.string().required(),
    groupId: Joi.string().required()
});

export const exportMessageLinkChannelDto = Joi.object().keys({
    channelId: Joi.string().required(),
    messageId: Joi.number().required()
});

export const joinChannelDto = Joi.object().keys({
    channelId: Joi.string().required()
});
