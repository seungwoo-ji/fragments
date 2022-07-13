// src/routes/api/get.js

const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');
const { createSuccessResponse } = require('../../response');

/**
 * Get a list of fragments for the current user
 */
module.exports = async (req, res) => {
  try {
    const data = await Fragment.byUser(req.user, req.query.expand);
    logger.debug({ data }, `fragment list data is found for user=${req.user}`);
    res.status(200).json(createSuccessResponse({ fragments: data }));
  } catch (error) {
    logger.error(error.message);
  }
};
