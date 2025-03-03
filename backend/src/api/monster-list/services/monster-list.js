'use strict';

/**
 * monster-list service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::monster-list.monster-list');
