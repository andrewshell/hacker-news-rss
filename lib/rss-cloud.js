(function () {
    "use strict";

    var config = require('./config'),
        logger = require('tracer').console();

    function ping(url) {
        var body = new URLSearchParams({'url': url});
        fetch(config.rssCloud.ping, {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'content-type': 'application/x-www-form-urlencoded'
            },
            body: body
        }).then(function (res) {
            return res.json().then(function (ping) {
                logger.info((ping.success ? 'success' : 'failure') + ' ' + res.status + ': ' + ping.msg);
            });
        }).catch(function (err) {
            logger.error(err);
        });
    }

    module.exports = {
        'ping': ping
    };
}());
