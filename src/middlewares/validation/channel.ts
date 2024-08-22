import Joi from "joi";

export const createChannelDto = Joi.object().keys({
  title: Joi.string().required(),
  about: Joi.string().optional(),
});

export const updateChannelDto = Joi.object().keys({
  channelId: Joi.string().required(),
  title: Joi.string(),
  username: Joi.string().min(1),
});

export const deleteChannelDto = Joi.object().keys({
  channelId: Joi.string().required(),
});

export const getBlockedChannelUsersDto = Joi.object().keys({
  channelId: Joi.string().required(),
  page: Joi.number(),
  limit: Joi.number(),
});

export const getChannelUsersDto = Joi.object().keys({
  channelId: Joi.string().required(),
  page: Joi.number(),
  limit: Joi.number(),
});

export const getChannelMessagesDto = Joi.object().keys({
  channelId: Joi.string().required(),
  page: Joi.number(),
  limit: Joi.number(),
});

export const addUserChannelDto = Joi.object().keys({
  channelId: Joi.string().required(),
  userIds: Joi.array().items(Joi.number().integer().min(1)).required(),
});

export const blockChannelUserDto = Joi.object().keys({
  channelId: Joi.string().required(),
  userId: Joi.number().required(),
});

export const checkUsernameDto = Joi.object().keys({
  channelId: Joi.string().required(),
  username: Joi.string().required(),
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
  forEveryone: Joi.boolean().required(),
});

export const getChannelInfoDto = Joi.object().keys({
  channelId: Joi.string().required(),
});

export const getChannelSponsoredMessagesDto = Joi.object().keys({
  channelId: Joi.string().required(),
});
export const getcChannelUser = Joi.object().keys({
  channelId: Joi.string().required(),
  userId: Joi.string().required(),
});

export const setChannelDiscussionGroupDto = Joi.object().keys({
  channelId: Joi.string().required(),
  groupId: Joi.string().required(),
});

export const exportMessageLinkChannelDto = Joi.object().keys({
  channelId: Joi.string().required(),
  messageId: Joi.number().required(),
});

export const joinChannelDto = Joi.object().keys({
  username: Joi.string().required(),
});

export const markAsReadChannelMessagesDto = Joi.object().keys({
  channelId: Joi.string().required(),
  messageIds: Joi.array().items(Joi.number().required()).required(),
});

export const leaveChannelDto = Joi.object().keys({
  channelId: Joi.string().required(),
});

export const deleteChannelMessagesDto = Joi.object().keys({
  channelId: Joi.string().required(),
  messageIds: Joi.array().items(Joi.number().required()).required(),
});

export const updateChannelAdminDto = Joi.object().keys({
  channelId: Joi.string().required(),
  userId: Joi.number().required(),
  adminRights: Joi.object({
    changeInfo: Joi.boolean().required(),
    postMessages: Joi.boolean().required(),
    editMessages: Joi.boolean().required(),
    deleteMessages: Joi.boolean().required(),
    banUsers: Joi.boolean().required(),
    inviteUsers: Joi.boolean().required(),
    pinMessages: Joi.boolean().required(),
    addAdmins: Joi.boolean().required(),
    anonymous: Joi.boolean().required(),
    manageCall: Joi.boolean().required(),
    other: Joi.boolean().required(),
    adminName: Joi.string().required(),
  }).optional(),
});

export const getAdminLogDto = Joi.object().keys({
  channelId: Joi.string().required(),
  limit: Joi.number().required(),
});

export const getChannelPollResults = Joi.object().keys({
  channelId: Joi.string().required(),
  pollId: Joi.string().required(),
});

export const sendPollToChannel = Joi.object().keys({
  channelId: Joi.string().required(),
  question: Joi.string().required(),
  options: Joi.array().items(Joi.string().required()).required(),
  multipleChoice: Joi.boolean().required(),
  isQuiz: Joi.boolean().required(),
  correctOptionId: Joi.number().optional(),
});

export const voiteInPollChannelDto = Joi.object().keys({
  channelId: Joi.string().required(),
  pollId: Joi.number().required(),
  optionIndexes: Joi.array().items(Joi.number().required()).required(),
});
