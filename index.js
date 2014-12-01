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

AffiliateWindow.prototype.limit = function (limit) {
  return this._limit = limit, this;
};

AffiliateWindow.prototype.one = function (one) {
  one = 'undefined' === typeof one ? true : !!one;
  return this._one = one, this._limit = 1, this;
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

AffiliateWindow.prototype.price = function (price) {
  price = _.isArray(price) ? price : price.split('..');

  if (price[0]) this.minPrice = price[0];
  if (price[1]) this.maxPrice = price[1];

  return this;
};

AffiliateWindow.prototype.done = function (cb) {
  var that = this;

  soap.createClient(endpoint, function (err, client) {
    client.addSoapHeader({
      'v3:UserAuthentication': {
        sApiKey: that._id
      }
    });
    client.getProductList(that.request(), format.call(that, cb));
  });
};

var format = function (cb) {
  var one = this._one
    , limit = this._limit;

  return function format (err, res) {
    // Handle errors
    if (err) return cb(err);

    // Grab results or lack thereof
    res = res.oProduct || [];

    // Format results
    res = formatResults(res);

    if (one) {
      res = _.first(res) || null;
    } else if (limit) {
      res = _.first(res, limit);
    }

    return cb(null, res);
  }
};

var formatResults = function (res) {
  return _.map(res, function (x) {
    return {
      id: x.iId,
      name: x.sName,
      currency: 'GBP',
      listPrice: x.fPrice,
      url: x.sAwDeepLink
    }
  });
};

AffiliateWindow.prototype.request = function () {
  var req = {}
    , refine = [];

  // Add keywords
  req.sQuery = this._keywords;

  // Add limits
  if (this._limit) req.iLimit = this._limit;

  // Add merchants
  if (this._merchants.length) refine.push(this.genMerchants());

  // Add prices
  if (this._minPrice || this._maxPrice) refine.push(this.genPrices());

  // Add refine groups to the request
  req.oActiveRefineByGroup = refine;

  return req;
};

AffiliateWindow.prototype.genMerchants = function () {
  return {
    iId: 3,
    sName: 'Merchant',
    oRefineByDefinition: _.map(this._merchants, function (x) {
      return {
        sId: x,
        sName: ''
      };
    })
  }
};

AffiliateWindow.prototype.genPrices = function () {
  var min = this._minPrice || ''
    , max = this._maxPrice || '';

  return {
    iId: 1,
    sName: 'Price',
    oRefineByDefinition: {
      sId: min + '_' + max,
      sName: ''
    }
  };
};
