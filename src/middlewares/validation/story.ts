import Joi from "joi"

export const createStoryDto = Joi.object().keys({
    peerId: Joi.string().optional(),
    me: Joi.boolean().optional(),
    pinned: Joi.boolean().optional(),
    noforwards: Joi.boolean().optional(),
    period: Joi.number().optional(),
    file: Joi.object({
        originalname: Joi.string().required(),
        mimetype: Joi.string().required(),
        buffer: Joi.binary().required(),
      }).optional(),
});

export const getPeerStoriesDto = Joi.object().keys({
    peerId: Joi.string().required()
});

export const editStoryDto = Joi.object().keys({
    peerId: Joi.string().optional(),
    me: Joi.boolean().optional(),
    id: Joi.number().optional(),
    file: Joi.object({
        originalname: Joi.string().required(),
        mimetype: Joi.string().required(),
        buffer: Joi.binary().required(),
    }).optional(),
});

export const deleteStoryDto = Joi.object().keys({
    peerId: Joi.string().optional(),
    me: Joi.boolean().required(),
    id: Joi.number().required()
});

export const exportStoryLinkDto = Joi.object().keys({
    peerId: Joi.string().optional(),
    id: Joi.number().required()
});