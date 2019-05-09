/**
 * `PureCloudAPIError` error.
 *
 * @constructor
 * @param {string} [message]
 * @param {number} [code]
 * @access public
 */
function PureCloudAPIError(message, code) {
  Error.call(this);
  Error.captureStackTrace(this, arguments.callee);
  this.name = 'PureCloudAPIError';
  this.message = message;
  this.code = code;
}

// Inherit from `Error`.
PureCloudAPIError.prototype.__proto__ = Error.prototype;


// Expose constructor.
module.exports = PureCloudAPIError;
