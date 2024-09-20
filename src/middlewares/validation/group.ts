import Joi from "joi";

export const createGroupDto = Joi.object().keys({
  title: Joi.string().required(),
  userIds: Joi.array().items(Joi.number().integer().min(1)).required(),
});

export const updateGroupDto = Joi.object().keys({
  id: Joi.string().required(),
  title: Joi.string().required(),
});

export const deleteGroupDto = Joi.object().keys({
  id: Joi.string().required(),
});

export const blockUserDto = Joi.object().keys({
  groupId: Joi.string().required(),
  userId: Joi.number().required(),
});

export const sendMessageToGroupDto = Joi.object().keys({
  groupId: Joi.string().optional(),
  scheduleDate: Joi.number().optional(),
  message: Joi.number().optional(),
  file: Joi.object({
    originalname: Joi.string().required(),
    mimetype: Joi.string().required(),
    buffer: Joi.binary().required(),
  }).optional(),
});

export const unBlockUserDto = Joi.object().keys({
  groupId: Joi.string().required(),
  userId: Joi.number().required(),
});

export const getGroupInfoDto = Joi.object().keys({
  groupId: Joi.string().required(),
});

export const getGroupMembersDto = Joi.object().keys({
  groupId: Joi.string().required(),
});

export const getScheduledMessagesDto = Joi.object().keys({
  groupId: Joi.string().required(),
});

export const getScheduledHistoryDto = Joi.object().keys({
  groupId: Joi.string().required(),
});

export const getChatInviteImportersDto = Joi.object().keys({
  groupId: Joi.string().required(),
  offset: Joi.number().required(),
  limit: Joi.number().required(),
  requested: Joi.boolean().required(),
  link: Joi.string().required(),
});

export const getAdminWithInvitesDto = Joi.object().keys({
  groupId: Joi.string().required(),
});

export const createForumTopicDto = Joi.object().keys({
  groupId: Joi.string().required(),
  title: Joi.string().required(),
});

export const updateForumTopicDto = Joi.object().keys({
  groupId: Joi.string().required(),
  topicId: Joi.number().required(),
  title: Joi.string().required(),
});

export const setTypingDto = Joi.object().keys({
  chatId: Joi.string().required()
});

export const getArchiveStickersDto = Joi.object().keys({
  offsetId: Joi.string().required(),
  limit: Joi.number().required()
});

export const pinMessageGroupDto = Joi.object().keys({
  groupId: Joi.string().required(),
  messageId: Joi.number().required(),
});

export const getGroupInviteLink = Joi.object().keys({
  groupId: Joi.string().required(),
  requestNeeded: Joi.boolean().required(),
  expireDate: Joi.number().optional(),
  title: Joi.string().optional(),
});

export const getGroupMessagesDto = Joi.object().keys({
  groupId: Joi.string().required(),
  page: Joi.number().required(),
  limit: Joi.number().required(),
});

export const getGroupOnlines = Joi.object().keys({
  groupId: Joi.string().required()
});

export const getForumTopics = Joi.object().keys({
  groupId: Joi.string().required()
});

export const checkGroupInviteLinkDto = Joi.object().keys({
  link: Joi.string().required(),
});

export const deleteGroupHistoryDto = Joi.object().keys({
  groupId: Joi.string().required(),
  forEveryone: Joi.boolean().required(),
});

export const deleteForumTopicDto = Joi.object().keys({
  groupId: Joi.string().required(),
  topicId: Joi.number().required()
});


export const deleteGroupMessagesDto = Joi.object().keys({
  groupId: Joi.string().required(),
  messageIds: Joi.array().items(Joi.number().required()).required(),
});

export const deleteMemberMessagesDto = Joi.object().keys({
  groupId: Joi.string().required(),
  userId: Joi.number().required(),
});

export const updateGroupAboutDto = Joi.object().keys({
  groupId: Joi.string().required(),
  userId: Joi.number().required(),
});

export const updateGroupPhotoDto = Joi.object().keys({
  groupId: Joi.string().optional(),
  file: Joi.object({
    originalname: Joi.string().required(),
    mimetype: Joi.string().required(),
    buffer: Joi.binary().required(),
  }).optional(),
});

export const updateGroupAdminDto = Joi.object().keys({
  groupId: Joi.string().required(),
  userId: Joi.number().required(),
  isAdmin: Joi.boolean().optional(),
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

export const deleteExportedChatInviteDto = Joi.object().keys({
  groupId: Joi.string().required(),
  link: Joi.string().required(),
});

export const deleteScheduledMessagesDto = Joi.object().keys({
  groupId: Joi.string().required(),
  messageIds: Joi.array().items(Joi.number().optional()).required(),
});

export const editChatDefaultBannedRights = Joi.object().keys({
  groupId: Joi.string().required(),
  bannedRights: Joi.object({
    untilDate: Joi.number().optional(),
    sendMedia: Joi.boolean().required(),
    sendStickers: Joi.boolean().required(),
    sendGifs: Joi.boolean().required(),
    sendGames: Joi.boolean().required(),
    sendInline: Joi.boolean().required(),
    sendPolls: Joi.boolean().required(),
    changeInfo: Joi.boolean().required(),
    inviteUsers: Joi.boolean().required(),
    pinMessages: Joi.boolean().required(),
  }).required(),
});

export const editExportedChatInviteDto = Joi.object().keys({
  groupId: Joi.string().required(),
  link: Joi.string().required(),
  expireDate: Joi.number().optional(),
  requestNeeded: Joi.boolean().optional(),
  title: Joi.string().optional(),
});

export const updateNotificationSettingsGroupDto = Joi.object().keys({
  groupId: Joi.string().required(),
  mute: Joi.boolean().required(),
  muteUntil: Joi.number().optional(),
  showPreviews: Joi.boolean().required()
});

export const getGroupPollResultsDto = Joi.object().keys({
  chatId: Joi.string().required(),
  pollId: Joi.string().required()
});

export const sendPollToGroupDto = Joi.object().keys({
  chatId: Joi.string().required(),
  question: Joi.string().required(),
  options: Joi.array().items(Joi.string().required()).required(),
  isAnonymous: Joi.boolean().required(),
  multipleChoice: Joi.boolean().required(),
  isQuiz: Joi.boolean().required(),
  correctOptionId: Joi.number().optional(),
});

export const voiteInPollDto = Joi.object().keys({
  chatId: Joi.string().required(),
  pollId: Joi.number().required(),
  optionIndexes: Joi.array().items(Joi.number().required()).required()
});
