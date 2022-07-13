const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');

module.exports = async (req, res) => {
  try {
    const fragment = await Fragment.byId(req.user, req.params.id);
    logger.debug({ fragment }, `fragment metadata is found for user=${req.user}`);
    res.status(200).json(createSuccessResponse({ fragment }));
  } catch (error) {
    logger.error(error.message);
    res.status(404).json(createErrorResponse(404, error.message));
  }
};
