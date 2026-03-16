(function () {
    "use strict";

    var async = require('async'),
        cache = {},
        cacheExpires = {},
        config = require('./config'),
        dirty = false,
        firebaseApp = require('firebase/app'),
        firebaseDb = require('firebase/database'),
        items = [],
        listenCallback,
        logger = require('tracer').console(),
        moment = require('moment'),
        queue = async.queue(addItem, 5)

    var app = firebaseApp.initializeApp({
        databaseURL: 'https://hacker-news.firebaseio.com/'
    });
    var db = firebaseDb.getDatabase(app);

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
            timeoutId,
            unsubscribe;

        function onItemChange(snapshot) {
            var val = snapshot.val();
            if (undefined === val || null === val) {
                return; // Wait for an update
            }
            clearTimeout(timeoutId);
            unsubscribe(); // Stop listening
            cache[childPath] = val;
            cacheExpires[childPath] = moment().utc().add(10, 'minutes');
            // logger.info('found ' + childPath);
            dirty = true;
            return callback(null);
        }
        function onItemChangeTimedOut() {
            logger.warn('timed out fetching ' + childPath);
            unsubscribe(); // Stop listening
            return callback('timed out ' + childPath);
        }
        if (undefined === cache[childPath]) {
            // logger.info('undefined ' + childPath);
            unsubscribe = firebaseDb.onValue(firebaseDb.ref(db, childPath), onItemChange);
            timeoutId = setTimeout(onItemChangeTimedOut, 5000); // Listen for 5 seconds
        } else {
            cacheExpires[childPath] = moment().utc().add(10, 'minutes');
            return callback(null);
        }
    }

    function getItemData() {
        var childPath,
            id,
            itemData = [];
        logger.info(items.length);
        for (id in items) {
            childPath = 'v0/item/' + items[id];
            if (undefined !== cache[childPath]) {
                itemData.push(cache[childPath]);
            }
        }
        return itemData;
    }

    function rebuildItems() {
        var itemData = [];
        if (dirty) {
            dirty = false;
            itemData = getItemData();
            logger.info(itemData.length);
            listenCallback(null, itemData);
        }
    }

    function listen(childPath, callback) {
        listenCallback = callback;
        setInterval(rebuildItems, 1000);
        var dbQuery = firebaseDb.query(
            firebaseDb.ref(db, childPath),
            firebaseDb.limitToFirst(config.rss.maxItems)
        );
        firebaseDb.onValue(dbQuery, function onValue(snapshot) {
            var val = snapshot.val();
            if (undefined === val || null === val) {
                logger.warn('Firebase returned null for ' + childPath);
                return;
            }
            items = val.slice(0);
            logger.info(items.length);
            queue.push(val, function mapAddItemCallback(err) {
                if (err) {
                    listenCallback(err);
                }
            });
        }, function onError(error) {
            logger.error('Firebase listener error on ' + childPath + ': ' + error.message);
        });
    }

    module.exports = {
        'listen': listen
    };

}());
