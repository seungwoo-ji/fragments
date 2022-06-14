const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');

/**
 * Create a new fragment for the current authenticated user
 */
module.exports = async (req, res) => {
  const data = req.body;

  if (!Buffer.isBuffer(data)) {
    logger.error('content type is not supported');
    res.status(415).json(createErrorResponse(415, 'content type is not supported'));

    return;
  }

  const fragment = new Fragment({ ownerId: req.user, type: req.get('content-type') });

  try {
    await fragment.setData(data);
    await fragment.getData();
    logger.debug({ fragment }, 'new fragment is created');

    res.set('location', `${process.env.API_URL}/v1/fragments/${fragment.id}`);
    res.status(201).json(createSuccessResponse({ fragment }));
  } catch (error) {
    logger.error(error.message);
    res.status(400).json(createErrorResponse(400, error.message));
  }
};
