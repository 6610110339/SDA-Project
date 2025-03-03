'use strict';

/**
 * character service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::character.character');
