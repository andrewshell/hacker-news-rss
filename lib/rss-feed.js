(function () {
    "use strict";

    var async = require('async'),
        builder = require('xmlbuilder'),
        feeds = {};

    function rssFeed(feed) {
        var self = this;

        if (undefined === feed) {
            return self;
        }

        self.feed = feed;
        if (undefined === self.feed.rss.channel.items) {
            self.feed.rss.channel['#list'] = [];
        }

        self.addItem = function (item, callback) {
            self.feed.rss.channel['#list'].unshift({'item': item});
            return callback(null);
        };

        return self;
    }

    rssFeed.prototype.addItems = function (items, callback) {
        var self = this;
        async.each(items, self.addItem, callback);
    };

    rssFeed.prototype.build = function (selfRel) {
        var self = this;
        self.feed.rss.channel['atom:link'] = {
            '@href': selfRel,
            '@rel': 'self',
            '@type': 'application/rss+xml'
        };
        return builder.create(self.feed).end({pretty: true});
    };

    function factory(name, channel) {
        if (undefined === feeds[name]) {
            feeds[name] = new rssFeed(channel);
        }
        return feeds[name];
    }

    module.exports = factory;
}());
