const { randomUUID } = require('crypto');
// Use https://www.npmjs.com/package/content-type to create/parse Content-Type headers
const contentType = require('content-type');

// Functions for working with fragment metadata/data using our DB
const {
  readFragment,
  writeFragment,
  readFragmentData,
  writeFragmentData,
  listFragments,
  deleteFragment,
} = require('./data');

const convertibleTypes = {
  'text/plain': ['text/plain'],
  'text/markdown': ['text/markdown', 'text/html', 'text/plain'],
  'text/html': ['text/html', 'text/plain'],
  'application/json': ['application/json', 'text/plain'],
  'image/png': ['image/png', 'image/jpeg', 'image/webp', 'image/gif'],
  'image/jpeg': ['image/png', 'image/jpeg', 'image/webp', 'image/gif'],
  'image/webp': ['image/png', 'image/jpeg', 'image/webp', 'image/gif'],
  'image/gif': ['image/png', 'image/jpeg', 'image/webp', 'image/gif'],
};

class Fragment {
  constructor({
    id,
    ownerId,
    created = new Date().toISOString(),
    updated = new Date().toISOString(),
    type,
    size = 0,
  }) {
    if (ownerId && type) {
      this.ownerId = ownerId;

      if (Fragment.isSupportedType(type)) {
        this.type = type;
      } else {
        throw new Error(`type string is invalid, got type=${type}`);
      }
    } else {
      throw new Error(
        `ownerId and type strings are required, got ownerId=${ownerId}, type=${type}`
      );
    }

    if (id) {
      this.id = id;
    } else {
      this.id = randomUUID();
    }

    if (typeof size === 'number' && size >= 0) {
      this.size = size;
    } else {
      throw new Error(`size must be a zero or a positive number, got size=${size}`);
    }

    this.created = created;
    this.updated = updated;
  }

  /**
   * Get all fragments (id or full) for the given user
   * @param {string} ownerId user's hashed email
   * @param {boolean} expand whether to expand ids to full fragments
   * @returns Promise<Array<Fragment>>
   */
  static byUser(ownerId, expand = false) {
    return listFragments(ownerId, expand);
  }

  /**
   * Gets a fragment for the user by the given id.
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<Fragment>
   */
  static async byId(ownerId, id) {
    const fragment = await readFragment(ownerId, id);
    if (!fragment)
      throw new Error(
        `fragment does not exist for the ownderId=${ownerId} id=${id}, got fragment=${fragment}`
      );

    return fragment;
  }

  /**
   * Delete the user's fragment data and metadata for the given id
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise
   */
  static delete(ownerId, id) {
    return deleteFragment(ownerId, id);
  }

  /**
   * Saves the current fragment to the database
   * @returns Promise
   */
  save() {
    this.updated = new Date().toISOString();

    return writeFragment(this);
  }

  /**
   * Gets the fragment's data from the database
   * @returns Promise<Buffer>
   */
  getData() {
    return readFragmentData(this.ownerId, this.id);
  }

  /**
   * Set's the fragment's data in the database
   * @param {Buffer} data
   * @returns Promise
   */
  async setData(data) {
    if (!Buffer.isBuffer(data))
      throw new Error(`fragment data must be a Buffer object, got data=${data}`);

    this.updated = new Date().toISOString();
    this.size = data.length;
    await writeFragment(this);

    return await writeFragmentData(this.ownerId, this.id, data);
  }

  /**
   * Returns the mime type (e.g., without encoding) for the fragment's type:
   * "text/html; charset=utf-8" -> "text/html"
   * @returns {string} fragment's mime type (without encoding)
   */
  get mimeType() {
    const { type } = contentType.parse(this.type);
    return type;
  }

  /**
   * Returns true if this fragment is a text/* mime type
   * @returns {boolean} true if fragment's type is text/*
   */
  get isText() {
    return this.mimeType.includes('text/');
  }

  /**
   * Returns the formats into which this fragment type can be converted
   * @returns {Array<string>} list of supported mime types
   */
  get formats() {
    return convertibleTypes[this.mimeType];
  }

  /**
   * Returns true if we know how to work with this content type
   * @param {string} value a Content-Type value (e.g., 'text/plain' or 'text/plain: charset=utf-8')
   * @returns {boolean} true if we support this Content-Type (i.e., type/subtype)
   */
  static isSupportedType(value) {
    const { type } = contentType.parse(value);

    return Object.keys(convertibleTypes).includes(type);
  }
}

module.exports.Fragment = Fragment;
