'use strict';

/**
 * upgrade service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::upgrade.upgrade');
