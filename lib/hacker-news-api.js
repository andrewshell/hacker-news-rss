(function () {
    "use strict";

    var async = require('async'),
        cache = {},
        cacheExpires = {},
        config = require('./config'),
        Firebase = require('firebase'),
        logger = require('tracer').console(),
        moment = require('moment'),
        ref;

    ref = new Firebase('https://hacker-news.firebaseio.com/');

    function pruneCache() {
        var childPath,
            expires,
            now = moment().utc();
        for (childPath in cacheExpires) {
            if (cacheExpires.hasOwnProperty(childPath)) {
                expires = cacheExpires[childPath];
                if (now.isAfter(expires)) {
                    delete cache[childPath];
                    delete cacheExpires[childPath];
                }
            }
        }
    }

    function addItem(id, callback) {
        var childPath = 'v0/item/' + id,
            timeoutId;
        logger.info(childPath);
        function onItemChange(snapshot) {
            var val = snapshot.val();
            clearTimeout(timeoutId);
            if (undefined === val || null === val) {
                return onItemChangeTimedOut();
            }
            ref.child(childPath).off('value', onItemChange); // Stop listening for changes
            cache[childPath] = val;
            cacheExpires[childPath] = moment().utc().add(10, 'minutes');
            callback(null, val);
        }
        function onItemChangeTimedOut() {
            ref.child(childPath).off('value', onItemChange); // Stop listening for changes
            callback('no data for ' + childPath);
        }
        if (undefined === cache[childPath]) {
            logger.info('undefined ' + childPath);
            ref.child(childPath).on('value', onItemChange);
            timeoutId = setTimeout(onItemChangeTimedOut, 1000);
        } else {
            cacheExpires[childPath] = moment().utc().add(10, 'minutes');
            callback(null, cache[childPath]);
        }
    }

    function listen(childPath, callback) {
        // Alert me of changes to v0/newstories
        ref.child(childPath).limitToFirst(config.rss.maxItems).on('value', function onValue(snapshot) {
            logger.info(snapshot.val().length);
            async.map(snapshot.val(), addItem, function mapAddItemCallback(err, items) {
                pruneCache();
                callback(err, items);
            });
        });
    }

    module.exports = {
        'listen': listen
    };

}());
