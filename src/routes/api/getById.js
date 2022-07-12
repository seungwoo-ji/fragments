const path = require('path');
const mime = require('mime-types');

const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const { createErrorResponse } = require('../../response');

/**
 * Get an authenticated user's fragment data
 */
module.exports = async (req, res) => {
  const { name, ext } = path.parse(req.params.id);

  try {
    const fragment = await Fragment.byId(req.user, name);
    const data = await fragment.getData();
    logger.debug({ data }, `fragment data is found for user=${req.user} fragment id=${name}`);

    if (!ext) {
      res.set('content-type', fragment.type);
      res.status(200).send(data);

      return;
    }

    if (fragment.formats.includes(mime.lookup(ext))) {
      res.set('content-type', fragment.type);
      res.status(200).send(data);
    } else {
      logger.error(
        'unknown/unsupported content type or the fragment cannot be converted to this type'
      );
      res
        .status(415)
        .json(
          createErrorResponse(
            415,
            'unknown/unsupported content type or the fragment cannot be converted to this type'
          )
        );

      return;
    }
  } catch (error) {
    logger.error(error.message);
    res
      .status(404)
      .json(createErrorResponse(404, `fragment id: ${name} does not represent a known fragment`));
  }
};
