var http = require('http');
var https = require('https');
var crypto = require('crypto');

var api = {
  host: 'tuner.pandora.com',
  path: '/services/json',
  username: 'android',
  password: 'AC7IBG09A3DTSYM4R41UJWL07VLN8JI7',
  deviceId: 'android-generic',
  decryptKey: 'R=U!LH$O2B#',
  encryptKey: '6#26FRL$ZWD'
};

var decipher = crypto.createDecipheriv('bf-ecb', new Buffer(api.decryptKey, 'utf8'), '');
var cipher = crypto.createCipheriv('bf-ecb', new Buffer(api.encryptKey, 'utf8'), '');

// Export Object
var pandora = exports;

/**
 * Convert ciphered into deciphered
 * @param  {String} ciphered Ciphered string
 * @return {String}          Deciphered string
 */
pandora.decrypt = function (ciphered) {
  var deciphered = decipher.update(ciphered, 'hex', 'utf8');
  deciphered += decipher.final('utf8');

  return deciphered;
};

/**
 * Convert string to ciphered
 * @param  {String} nonciphered String to be ciphered
 * @return {String}             Ciphered string
 */
pandora.encrypt = function(nonciphered) {
  var ciphered = cipher.update(nonciphered, 'utf8', 'hex');
  ciphered += cipher.final('hex');

  return ciphered;
};

/**
 * Convert to a usuable syncTime
 * @param  {String} encryptedSyncTime Original encrypted syncTime sent by server
 * @return {Number}                   Valid syncTime
 */
pandora.convertToSyncTime = function (encryptedSyncTime) {
  // Decrypt string
  var decryptedSyncTime = this.decrypt(encryptedSyncTime);

  // Remove first 4 garbage characters
  decryptedSyncTime = decryptedSyncTime.substr(4);

  // Convert to number timestamp
  var syncTime = parseInt(decryptedSyncTime);

  return syncTime;
};

/**
 * Get value of the current calculated syncTime
 * @return {Number}
 */
pandora.calcSyncTime = function () {
  // Current timestamp
  var now = new Date().getTime();

  // Add current timestamp with syncTime timstamp
  return now + api.syncTime;
};

pandora.encryptEncodeJSON = function (object) {
  var json = JSON.stringify(object);
  return this.encrypt(json);
};

pandora.serializeObject = function (obj) {
  return Object.keys(obj).map(function(key) {
    return key + '=' + encodeURIComponent(obj[key]);
  }).join('&');
};

pandora.partnerAuth = function (callback) {
  var that = this;

  var json = JSON.stringify({
    username: api.username,
    password: api.password,
    deviceModel: api.deviceId,
    version: '5'
  });

  var parameters = {
    method: 'auth.partnerLogin'
  };

  var options = {
    hostname: api.host,
    port: 443,
    path: api.path + '/?' + that.serializeObject(parameters),
    method: 'POST',
    headers: {
      'Content-Type' : 'application/json',
      'Content-Length' : Buffer.byteLength(json, 'utf8')
    }
  };

  var req = https.request(options, function (res) {
    res.on('data', function (data) {
      data = JSON.parse(data.toString());

      if (data.stat !== 'ok') {
        console.error('[Error] Partner Auth Failed.', data);
        callback(false);
      } else {
        var result = data.result;
        api.partnerId = result.partnerId;
        api.partnerAuthToken = result.partnerAuthToken;
        api.syncTime = that.convertToSyncTime(result.syncTime);
        callback(true);
      }
    });
  });

  req.write(json);
  req.end();
  req.on('error', function (err) {
    console.error(err);
  });
};

pandora.userAuth = function (username, password, callback) {
  var that = this;

  var json = that.encryptEncodeJSON({
    loginType: 'user',
    username: username,
    password: password,
    partnerAuthToken: api.partnerAuthToken,
    syncTime: that.calcSyncTime()
  });

  var parameters = {
    method: 'auth.userLogin',
    partner_id: api.partnerId,
    auth_token: api.partnerAuthToken
  };

  var options = {
    hostname: api.host,
    port: 443,
    path: api.path + '/?' + that.serializeObject(parameters),
    method: 'POST',
    headers: {
      'Content-Type' : 'application/json',
      'Content-Length' : Buffer.byteLength(json, 'utf8')
    }
  };

  var req = https.request(options, function (res) {
    res.on('data', function (data) {
      data = JSON.parse(data.toString());

      if (data.stat !== 'ok') {
        console.error('[Error] User Auth Failed.', data);
        callback(false);
      } else {
        var result = data.result;
        console.log(result);

        api.userAuthToken = result.userAuthToken;
        api.userId = result.userId;

        callback(true);
      }
    });
  });

  req.write(json);
  req.end();
  req.on('error', function (err) {
    console.error(err);
  });
};

pandora.getStations = function (callback) {
  if ('userAuthToken' in api && 'partnerId' in api && 'userId' in api) {

  } else {

  }
};
