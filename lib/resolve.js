/**
 * Module dependencies.
 */
var uri = require('url')
  , request = require('request')
  , debug = require('debug')('nds-openidconfiguration');


/**
 *
 * References:
 *  - [OpenID Connect Discovery 1.0 - draft 21](http://openid.net/specs/openid-connect-discovery-1_0.html)
 *
 * @param {Object} options
 * @return {Function}
 * @api public
 */
module.exports = function() {
  
  return function openidConfiguration(id, cb) {
    debug('%s', id);
    
    var url = uri.resolve(id, '.well-known/openid-configuration');
    
    request({
      url: url,
      headers: {
        'Accept': 'application/json'
      }
    }, function handle(err, res, body) {
      if (err) { return cb(err); }
      if (res.statusCode == 404) {
        // OpenID provider configuration not supported by this entity.  Invoke
        // callback without an error or metadata.  If additional mechanisms are
        // supported, attempts to retrieve metadata will continue.
        return cb();
      }
      if (res.statusCode != 200) {
        return cb(new Error('Unexpected status ' + res.statusCode + ' from ' + url));
      }
      
      var json;
      try {
        json = JSON.parse(body);
      } catch (ex) {
        return cb(new Error('Failed to parse OpenID provider configuration from ' + url));
      }
      
      // TODO: resolve any relative URLs
      
      var meta = {}
      meta.id =
      meta.issuer = json.issuer;
      meta.jwksUrl = json.jwks_uri;
      
      // TODO: Set trusted flag if resolved over secure protocol
      
      return cb(null, meta);
    });
  };
};
