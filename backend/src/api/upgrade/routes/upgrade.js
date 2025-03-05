'use strict';

/**
 * upgrade router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::upgrade.upgrade');
