(function () {
    "use strict";

    var app,
        async = require('async'),
        appConfigHandlebars = require('./lib/app-config-handlebars'),
        express = require('express'),
        config = require('./lib/config'),
        server,
        hnApi = require('./lib/hacker-news-api'),
        rssCloud = require('./lib/rss-cloud'),
        rssFeed = require('./lib/rss-feed'),
        newstories,
        logger = require('tracer').console(),
        moment = require('moment');

    logger.log(config.app.name + ' ' + config.app.version);

    app = express();

    appConfigHandlebars(app);

    // Handle static files in public directory
    app.use(express.static('public', {
        dotfiles: 'ignore',
        maxAge: '1d'
    }));

    // Translates a hnApi item into RSS 2.0 item
    function formatRssItem(item, callback) {
        var rssItem = {};
        rssItem.title = item.title;
        rssItem.link = item.url;
        rssItem.comments = 'https://news.ycombinator.com/item?id=' + item.id;
        rssItem.guid = {
            '#text': rssItem.comments,
            '@isPermaLink': false
        };
        rssItem.pubDate = moment.utc(item.time, 'X').format('ddd, DD MMM YYYY HH:mm:ss') + ' GMT';
        return callback(null, {'item': rssItem});
    }

    // Homepage

    app.get('/', function (req, res) {
        switch (req.accepts('html')) {
        case 'html':
            res.render('index');
            break;
        default:
            res.status(406).send('Not Acceptable');
            break;
        }
    });

    // Feed for newstories

    newstories = rssFeed('newstories', {
        rss: {
            '@version': '2.0',
            '@xmlns:atom': 'http://www.w3.org/2005/Atom',
            channel: {
                title: 'Hacker News Firehose',
                description: 'All links posted to Hacker News.',
                link: 'https://news.ycombinator.com/newest',
                language: 'en-us',
                'atom:link': {},
                cloud: {
                    '@domain': 'rpc.rsscloud.io',
                    '@port': 5337,
                    '@path': '/ping',
                    '@registerProcedure': '',
                    '@protocol': 'http-post'
                }
            }
        }
    });

    hnApi.listen('v0/newstories', function (err, items) {
        if (err) {
            return logger.error(err);
        }
        async.map(items, formatRssItem, function (err, items) {
            if (err) {
                return logger.error(err);
            }
            newstories.setItems(items);
            rssCloud.ping(config.app.host + '/newstories.xml');
        });
    });

    app.get('/newstories.xml', function (req, res) {
        switch (req.accepts('xml')) {
        case 'xml':
            res.set('Content-Type', 'application/rss+xml');
            res.send(newstories.build(config.app.host + '/newstories.xml'));
            break;
        default:
            res.status(406).send('Not Acceptable');
            break;
        }
    });

    // Start server
    server = app.listen(config.server.port, function () {
        var host = server.address().address,
            port = server.address().port;

        logger.log('Listening at http://%s:%s', host, port);
    })
        .on('error', function (error) {
            switch (error.code) {
            case 'EADDRINUSE':
                logger.error('Error: Port ' + config.server.port + ' is already in use.');
                break;
            default:
                logger.error(error.code);
            }
        });
}());
