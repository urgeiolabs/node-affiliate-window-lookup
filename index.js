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

AffiliateWindow.prototype._merchants = [];

AffiliateWindow.prototype.id = function (id) {
  return this._id = id, this;
};

/**
 * AffiliateWindow#merchant - select merchants to search within
 * @param {String/Array} merchant - merchant or array of merchants to search within
 * @returns this
 */
AffiliateWindow.prototype.merchant = function (merchant) {
  merchant = _.isArray(merchant) ? merchant : _.toArray(arguments);
  return this._merchants = this._merchants.concat(merchant), this;
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
