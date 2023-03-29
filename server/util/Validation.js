const { string } = require("joi");
const Joi = require("joi");

const Joischema = Joi.object({
  email: Joi.string().email().required(),
  animeName: Joi.string().required(),
  producer: Joi.string().required(),
  rate: Joi.string().required(),
});

module.exports = Joischema;
