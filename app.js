(function () {
    "use strict";

    var app,
        async = require('async'),
        appConfigHandlebars = require('./lib/app-config-handlebars'),
        express = require('express'),
        config = require('./lib/config'),
        server,
        hnApi = require('./lib/hacker-news-api'),
        rssFeed = require('./lib/rss-feed'),
        newstories;

    console.log(config.app.name + ' ' + config.app.version);

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
        rssItem.guid = rssItem.comments;
        callback(null, rssItem);
    }

    // Homepage

    app.get('/', function (req, res) {
        res.render('index');
    });

    // Feed for newstories

    newstories = rssFeed('newstories', {
        rss: {
            '@version': '2.0',
            '@xmlns:atom': 'http://www.w3.org/2005/Atom',
            channel: {
                title: 'New Links | Hacker News',
                description: 'New links posted to Hacker News',
                link: 'https://news.ycombinator.com/newest',
                language: 'en-us',
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
            return console.error(err);
        }
        async.map(items, formatRssItem, function (err, items) {
            newstories.addItems(items);
        });
    });

    app.get('/newstories.xml', function (req, res) {
        res.set('Content-Type', 'application/rss+xml');
        res.send(newstories.build(config.app.host + '/newstories.xml'));
    });

    // Start server
    server = app.listen(config.server.port, function () {
        var host = server.address().address,
            port = server.address().port;

        console.log('Listening at http://%s:%s', host, port);
    })
        .on('error', function (error) {
            switch (error.code) {
            case 'EADDRINUSE':
                console.log('Error: Port ' + config.server.port + ' is already in use.');
                break;
            default:
                console.log(error.code);
            }
        });
}());
