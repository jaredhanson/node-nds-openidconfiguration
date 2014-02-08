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
      if (res.statusCode != 200) {
        // TODO: Parse error response
        // TODO: 404 should be non fatal
        return cb(new Error('Failed OpenID configuration with status code: ' + res.statusCode));
      }
      
      var json;
      try {
        json = JSON.parse(body);
      } catch (ex) {
        return cb(new Error('Unable to parse OpenID configuration response'));
      }
      
      // TODO: resolve any relative URLs
      
      var entity = {}
      entity.id =
      entity.issuer = json.issuer;
      entity.jwksUrl = json.jwks_uri;
      
      // TODO: Set trusted flag if resolved over secure protocol
      
      return cb(null, entity);
    });
  };
};
