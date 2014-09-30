/**
 * Module dependencies
 */
var soap = require('soap')
  , _ = require('underscore');

var endpoint = 'http://v3.core.com.productserve.com/ProductServeService.wsdl';

/**
 * AffiliateWindow
 */
var AffiliateWindow = module.exports = function AffiliateWindow (opts) {
  if (!(this instanceof AffiliateWindow)) return new AffiliateWindow (opts);

  opts = opts || {};

  this._keywords = opts.keywords;
};

AffiliateWindow.prototype.id = function (id) {
  return this._id = id, this;
};

AffiliateWindow.prototype.done = function (cb) {
  var that = this;

  soap.createClient(endpoint, function (err, client) {
    client.addSoapHeader({
      'v3:UserAuthentication': {
        sApiKey: that._id
      }
    });
    client.getProductList({sQuery: that._keywords}, cb);
  });
};
