import Joi from "joi";

export const updateProfileDto = Joi.object().keys({
  firstName: Joi.string(),
  lastName: Joi.string(),
  about: Joi.string()
});

export const updateUsernameProfileDto = Joi.object().keys({
  username: Joi.string().required()
});

export const updateProfilePhotoDto = Joi.object().keys({
  file: Joi.object({
    originalname: Joi.string().required(),
    mimetype: Joi.string().required(),
    buffer: Joi.binary().required(),
  }).optional()
});

export const deleteProfilePhotoDto = Joi.object().keys({
   photoId: Joi.string().required(),
   accessHash: Joi.string().required(),
   fileReference: Joi.object().required()
});

export const terminateSessionDto = Joi.object().keys({
  hash: Joi.string().required()
});