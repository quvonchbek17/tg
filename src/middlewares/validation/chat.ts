import Joi from "joi"


export const getChatMessagesDto = Joi.object().keys({
  chatId: Joi.string().required()
});

export const getUserChatInfoDto = Joi.object().keys({
  chatId: Joi.string().required()
});


export const sendMessageToChatDto = Joi.object().keys({
    chatId: Joi.string(),
    message: Joi.string().optional(),
    file: Joi.object({
      originalname: Joi.string().required(),
      mimetype: Joi.string().required(),
      buffer: Joi.binary().required(),
    }).optional(),
});


export const updateMessageToChatDto = Joi.object().keys({
  messageId: Joi.string().optional(),
  newMessage: Joi.string().optional(),
  scheduleDate: Joi.number().optional(),
  file: Joi.object({
    originalname: Joi.string().required(),
    mimetype: Joi.string().required(),
    buffer: Joi.binary().required(),
  }).optional(),
});

export const deleteMessageInChatDto = Joi.object().keys({
  chatId: Joi.string().required(),
  messageIds: Joi.array().items(Joi.number().required()).required()
});

export const deleteChatHistoryDto = Joi.object().keys({
  chatId: Joi.string().required(),
  forEveryone: Joi.boolean().required()
});


export const updateNotificationSettingsUserDto = Joi.object().keys({
  chatId: Joi.string().required(),
  mute: Joi.boolean().required(),
  muteUntil: Joi.number().optional(),
  showPreviews: Joi.boolean().required()
});
