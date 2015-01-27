(function() {
  'use strict';

  var $ = require('./js/jquery');
  var ipc = require('ipc');

  $('#login').submit(function (event) {
    event.preventDefault();

    var username = $('#login input[name="username"]').val();
    var password = $('#login input[name="password"]').val();

    if (username === '' || password === '') {
      return;
    }

    ipc.send('login', {
      user: username,
      pass: password
    });
  });

  ipc.on('login-attempt', function (success) {
    if (success) {
      console.log('success');
    }
  });

})();
