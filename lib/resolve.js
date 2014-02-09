/**
 * Module dependencies.
 */
var uri = require('url')
  , request = require('request')
  , debug = require('debug')('nds-openidconfiguration');


/**
 * Resolves OpenID provider metadata.
 *
 * This resolver resolves metadata about OpenID providers that implement OpenID
 * Connect.  The `id` in this situation is the "issuer identifer" of the OpenID
 * provider.  This same identifier is the result of performing issuer discovery
 * and is also present as the issuer claim in assertions (aka tokens) issued by
 * the provider.
 *
 * Requests for metadata are sent over HTTPS, ensuring that claims are
 * verifiably asserted by the OpenID provider itself.
 *
 * Note that it is not considered an error if claims required by OpenID Connect
 * Discovery are missing.  If these claims are required by an application, it is
 * the application's responsibility to check for their existence.
 * 
 * Rationale: OpenID Connect is a layer on top of OAuth 2.0.  Many of the claims
 * apply broadly to any entity that participates in an OAuth 2.0 flow, including
 * those that don't implement OpenID Connect.  For example, server-to-server
 * authentication may make use of JWT assertions verified using public keys in a
 * JWK Set.  In such a flow, the "authorization_endpoint" claim required by
 * OpenID Connect is not needed.  In the absence of a more generally applicable
 * specification, it was decided to relax the constraints.
 *
 * References:
 *  - [OpenID Connect Discovery 1.0 - draft 21](http://openid.net/specs/openid-connect-discovery-1_0.html)
 *
 * @param {Object} options
 * @return {Function}
 * @api public
 */
module.exports = function(options) {
  options = options || {};
  
  return function openidConfiguration(id, cb) {
    debug('%s', id);
    
    var url = uri.parse(id);
    if (!url.protocol) { return cb(); }
    if (!(url.protocol == 'https:' || (url.protocol == 'http:' && options.secure === false))) { return cb(); }
    
    var base = id;
    if (base[base.length - 1] != '/') { base = base + '/'; }
    
    url = uri.resolve(base, '.well-known/openid-configuration');
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
      
      if (id != json.issuer) {
        return cb(new Error('Issuer mismatch in OpenID provider configuration from ' + url));
      }
      
      var meta = {};
      meta.id =
      meta.issuer = json.issuer;
      meta.authorizationUrl = json.authorization_endpoint;
      meta.tokenUrl = json.token_endpoint;
      meta.userInfoUrl = json.userinfo_endpoint;
      meta.jwksUrl = json.jwks_uri;
      meta.registrationUrl = json.registration_endpoint;
      
      // TODO: parse additional metadata
      
      return cb(null, meta);
    });
  };
};
