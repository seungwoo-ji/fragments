const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const { createErrorResponse } = require('../../response');

const typeExtensions = {
  txt: 'text/plain',
  md: 'text/markdown',
  html: 'text/html',
  json: 'application/json',
  png: 'image/png',
  jpg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
};

/**
 * Get an authenticated user's fragment data
 */
module.exports = async (req, res) => {
  const [id, extension] = req.params.id.split('.');

  try {
    const fragment = await Fragment.byId(req.user, id);
    const data = await fragment.getData();
    logger.debug({ data }, `fragment data is found for user=${req.user} id=${id}`);

    if (!extension) {
      res.set('content-type', fragment.type);
      res.status(200).send(data);

      return;
    }

    if (fragment.formats.includes(typeExtensions[extension])) {
      res.set('content-type', typeExtensions[extension]);
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
    res.status(404).json(createErrorResponse(404, `id: ${id} does not represent a known fragment`));
  }
};
