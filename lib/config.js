(function () {
    "use strict";

    var nconf = require('nconf');

    // Setup nconf to use (in-order):
    //   1. Overrides
    //   2. Command-line arguments
    //   3. Environment variables
    //   4. Default values
    nconf
        .overrides({
            'APP_NAME': 'hackerNewsRss',
            'APP_VERSION': nconf.version
        })
        .argv()
        .env()
        .defaults({
            "PORT": 8080,
            "RSS_CLOUD_PING": 'http://rpc.rsscloud.io:5337/ping',
            "APP_HOST": 'http://hn.geekity.com'
        });

    module.exports = {
        app: {
            name: nconf.get('APP_NAME'),
            version: nconf.get('APP_VERSION'),
            host: nconf.get('APP_HOST')
        },
        rssCloud: {
            ping: nconf.get('RSS_CLOUD_PING')
        },
        server: {
            port: nconf.get('PORT')
        }
    };
}());
