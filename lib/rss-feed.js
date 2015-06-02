(function () {
    "use strict";

    var builder = require('xmlbuilder'),
        feeds = {},
        logger = require('tracer').console();

    function RssFeed(feed) {
        var self = this;

        if (undefined === feed) {
            return self;
        }

        self.feed = feed;
        if (undefined === self.feed.rss.channel.items) {
            self.feed.rss.channel['#list'] = [];
        }

        return self;
    }

    RssFeed.prototype.setItems = function (items) {
        var self = this;
        logger.info(items.length);
        self.feed.rss.channel['#list'] = items;
    };

    RssFeed.prototype.build = function (selfRel) {
        var self = this;
        self.feed.rss.channel['atom:link'] = {
            '@href': selfRel,
            '@rel': 'self',
            '@type': 'application/rss+xml'
        };
        return builder.create(self.feed).end({pretty: true});
    };

    RssFeed.prototype.getFeed = function () {
        var self = this;
        return self.feed;
    };

    function factory(name, channel) {
        if (undefined === feeds[name]) {
            feeds[name] = new RssFeed(channel);
        }
        return feeds[name];
    }

    module.exports = factory;
}());
