import Joi from "joi";

export const updateProfileDto = Joi.object().keys({
  firstName: Joi.string(),
  lastName: Joi.string(),
  about: Joi.string()
});