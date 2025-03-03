'use strict';

/**
 * character controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::character.character');
