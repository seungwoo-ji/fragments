const contentType = require('content-type');
const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');

module.exports = async (req, res) => {
  try {
    const data = req.body;

    if (!Buffer.isBuffer(data)) {
      logger.error('content type is not supported');
      res.status(415).json(createErrorResponse(415, 'content type is not supported'));

      return;
    }

    const fragment = await Fragment.byId(req.user, req.params.id);
    logger.debug(
      { fragment },
      `fragment is found for user=${req.user} fragment id=${req.params.id}`
    );

    if (contentType.parse(req.get('content-type')).type === fragment.mimeType) {
      fragment.setData(data);
      logger.debug({ fragment }, 'fragment is updated');

      res.status(200).json(createSuccessResponse({ fragment }));
    } else {
      logger.error('content-type of the request does not match to the existing fragment type');
      res
        .status(400)
        .json(
          createErrorResponse(
            400,
            'content-type of the request does not match to the existing fragment type'
          )
        );
    }
  } catch (error) {
    logger.error(error.message);
    res.status(404).json(createErrorResponse(404, error.message));
  }
};
