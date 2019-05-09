'use strict';

const util = require('util');
const OAuth2Strategy = require('passport-oauth2');
const PureCloudAPIError = require('./errors/purecloudapierror')
const Profile = require('./profile');

/**
 * `Strategy` constructor.
 *
 * The PureCloud authentication strategy authenticates requests by delegating to
 * PureCloud using the OAuth 2.0 protocol.
 *
 * Applications must supply a `function` which accepts an `accessToken`,
 * `refreshToken` and service-specific `profile`, and then calls the `done`
 * callback supplying a `user`, which should be set to `false` if the
 * credentials are not valid.  If an exception occured, `err` should be set.
 *
 * Options:
 *   - `clientID`      your PureCloud Client ID
 *   - `clientSecret`  your PureCloud Client Secret
 *   - `callbackURL`   URL to which PureCloud will redirect the user after granting authorization
 *
 * Examples:
 *
 *     passport.use(new PureCloudStrategy({
 *         clientID: 'the-client-id',
 *         clientSecret: 'shhh-its-a-secret'
 *         callbackURL: 'https://www.example.net/auth/purecloud/callback'
 *       },
 *       function(accessToken, refreshToken, profile, done) {
 *         User.findOrCreate(..., function (err, user) {
 *           done(err, user);
 *         });
 *       }
 *     ));
 *
 * @constructor
 * @param {object} options
 * @param {function} verify
 * @access public
 */
function Strategy(options, verify) {
  options = options || {};
  options.authorizationURL = options.authorizationURL || 'https://login.mypurecloud.com/oauth/authorize';
  options.tokenURL = options.tokenURL || 'https://login.mypurecloud.com/oauth/token';
  options.scopeSeparator = options.scopeSeparator || ' ';
  options.scope = options.scope;

  OAuth2Strategy.call(this, options, verify);
  this.name = 'purecloud';
  this._userProfileURL = options.profileURL || 'https://api.mypurecloud.com/api/v2/users/me';
  this._oauth2.useAuthorizationHeaderforGET(true);
}

// Inherit from `OAuth2Strategy`.
util.inherits(Strategy, OAuth2Strategy);

/**
 * Retrieve user profile from PureCloud.
 *
 * This function constructs a normalized profile, with the following properties:
 *
 *   - `provider`         always set to `purecloud`
 *   - `id`
 *   - `username`
 *   - `displayName`
 *
 * @param {string} accessToken
 * @param {function} done
 * @access protected
 */
Strategy.prototype.userProfile = function(accessToken, done) {
  var self = this;
  this._oauth2.get(this._userProfileURL, accessToken, function (err, body, res) {
    var json;
    
    if (err) {
      if (err.data) {
        try {
          json = JSON.parse(err.data);
        } catch (_) {}
      }
      
      return done(new PureCloudAPIError(json.message, json.code));
    }
    
    try {
      json = JSON.parse(body);
    } catch (ex) {
      return done(new Error('Failed to parse user profile'));
    }
    
    var profile = Profile.parse(json);
    profile.provider  = 'purecloud';
    profile._raw = body;
    profile._json = json;
    
    done(null, profile);
  });
}

// Expose constructor.
module.exports = Strategy;
