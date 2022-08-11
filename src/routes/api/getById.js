const path = require('path');
const mime = require('mime-types');
const md = require('markdown-it')();
const sharp = require('sharp');

const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const { createErrorResponse } = require('../../response');

const isImageType = (type) => {
  return ['image/png', 'image/jpeg', 'image/webp', 'image/gif'].some((e) => e === type);
};

/**
 * Get an authenticated user's fragment data
 */
module.exports = async (req, res) => {
  const { name, ext } = path.parse(req.params.id);
  const type = mime.lookup(ext) || '';

  try {
    const fragment = await Fragment.byId(req.user, name);
    let data = await fragment.getData();
    logger.debug({ data }, `fragment data is found for user=${req.user} fragment id=${name}`);

    if (!ext) {
      res.set('content-type', fragment.type);
      res.status(200).send(data);

      return;
    }

    if (fragment.formats.includes(type)) {
      // Check if the conversion type is same as the current fragment type
      if (fragment.mimeType !== type) {
        if (fragment.mimeType === 'text/markdown' && type === 'text/html') {
          data = md.render(data.toString());
        } else if (isImageType(fragment.mimeType) && isImageType(type)) {
          const format = type.split('/')[1];
          data = await sharp(data).toFormat(format).toBuffer();
        }
      }

      logger.debug(
        `fragment of type=${fragment.mimeType} is converted to type=${type} successfully`
      );

      res.set('content-type', type);
      res.status(200).send(data);
    } else {
      logger.error(
        `unknown/unsupported content type or the fragment of type=${fragment.mimeType} cannot be converted to ${type}`
      );

      res
        .status(415)
        .json(
          createErrorResponse(
            415,
            `unknown/unsupported content type or the fragment of type=${fragment.mimeType} cannot be converted to ${type}`
          )
        );
    }
  } catch (error) {
    logger.error(error.message);
    res.status(404).json(createErrorResponse(404, error.message));
  }
};
