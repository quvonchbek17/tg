import Joi from "joi";

export const createGroupDto = Joi.object().keys({
    title: Joi.string().required(),
    userIds: Joi.array().items(Joi.number().integer().min(1)).required()
});

export const updateGroupDto = Joi.object().keys({
  id: Joi.string().required(),
  title: Joi.string().required(),
});

export const deleteGroupDto = Joi.object().keys({
    id: Joi.string().required()
});

export const blockUserDto = Joi.object().keys({
  groupId: Joi.string().required(),
  userId: Joi.number().required()
});

export const unBlockUserDto = Joi.object().keys({
  groupId: Joi.string().required(),
  userId: Joi.number().required()
});

export const getGroupInfoDto = Joi.object().keys({
  groupId: Joi.string().required()
});

export const getGroupMembersDto = Joi.object().keys({
  groupId: Joi.string().required()
});

export const pinMessageGroupDto = Joi.object().keys({
  groupId: Joi.string().required(),
  messageId: Joi.number().required()
});

export const getGroupInviteLink = Joi.object().keys({
  groupId: Joi.string().required()
});

export const getGroupMessagesDto = Joi.object().keys({
  groupId: Joi.string().required(),
  page: Joi.number().required(),
  limit: Joi.number().required()
});

export const checkGroupInviteLinkDto = Joi.object().keys({
  link: Joi.string().required()
});

export const deleteGroupHistoryDto = Joi.object().keys({
  groupId: Joi.string().required(),
  forEveryone: Joi.boolean().required()
});

export const deleteGroupMessagesDto = Joi.object().keys({
  groupId: Joi.string().required(),
  messageIds: Joi.array().items(Joi.number().required()).required()
});

export const deleteMemberMessagesDto = Joi.object().keys({
  groupId: Joi.string().required(),
  userId: Joi.number().required()
});

export const updateGroupAboutDto = Joi.object().keys({
  groupId: Joi.string().required(),
  userId: Joi.number().required()
});

export const updateGroupPhotoDto = Joi.object().keys({
  groupId: Joi.string().optional(),
  file: Joi.object({
    originalname: Joi.string().required(),
    mimetype: Joi.string().required(),
    buffer: Joi.binary().required(),
  }).optional(),
});