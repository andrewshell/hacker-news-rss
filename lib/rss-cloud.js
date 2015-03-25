(function () {
    "use strict";

    var config = require('./config'),
        request = require('request'),
        logger = require('tracer').console();

    function pingResponse(err, res, body) {
        var ping;
        if (err) {
            return logger.error(err);
        }
        try {
            ping = JSON.parse(body);
            logger.info((ping.success ? 'success' : 'failure') + ' ' + res.statusCode + ': ' + ping.msg);
        } catch (e) {
            logger.error(e);
        }
    }

    function ping(url) {
        var options = {
            headers: {
                accept: 'application/json'
            },
            form: {'url': url}
        };
        request.post(config.rssCloud.ping, options, pingResponse);
    }

    module.exports = {
        'ping': ping
    };
}());
