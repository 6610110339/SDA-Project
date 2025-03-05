'use strict';

/**
 * upgrade controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::upgrade.upgrade');
