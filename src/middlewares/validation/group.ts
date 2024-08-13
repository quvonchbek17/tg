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

export const getInviteLink = Joi.object().keys({
  groupId: Joi.string().required()
});

export const getGroupMessagesDto = Joi.object().keys({
  groupId: Joi.string().required(),
  page: Joi.number().required(),
  limit: Joi.number().required()
});