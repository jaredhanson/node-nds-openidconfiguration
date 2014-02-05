var uri = require('url')
  , request = require('request')
  , debug = require('debug')('nds-openidconfiguration');


module.exports = function() {
  
  return function openidConfiguration(id, cb) {
    debug('%s', id);
    
    var url = uri.resolve(id, '.well-known/openid-configuration');
    
    request.get(url, function handle(err, res, body) {
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
      
      var entity = {}
      entity.id =
      entity.issuer = json.issuer;
      entity.jwksUrl = json.jwks_uri;
      
      // TODO: Set trusted flag if resolved over secure protocol
      
      return cb(null, entity);
    });
  };
};
