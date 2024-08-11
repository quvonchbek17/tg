import Joi from "joi";

export const savedMessageGetQueryDto = Joi.object().keys({
  limit: Joi.number().required(),
});

export const createSavedMessageDto = Joi.object().keys({
    message: Joi.string().optional(),
    file: Joi.object({
      originalname: Joi.string().required(),
      mimetype: Joi.string().required(),
      buffer: Joi.binary().required(),
    }).optional(),
});

export const createMultiSavedMessageDto = Joi.object().keys({
    message: Joi.string().optional(),
    files: Joi.array().items(
      Joi.object({
        originalname: Joi.string().required(),
        mimetype: Joi.string().required(),
        buffer: Joi.binary().required(),
      })
    ).optional(),
  });


export const updateSavedMessageDto = Joi.object().keys({
    message_id: Joi.number(),
    message: Joi.string().optional(),
    file: Joi.object({
      originalname: Joi.string().required(),
      mimetype: Joi.string().required(),
      buffer: Joi.binary().required(),
    }).optional(),
});


export const deleteSavedMessageDto = Joi.object().keys({
  messageId: Joi.number().required(),
});
