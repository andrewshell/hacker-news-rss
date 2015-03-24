(function () {
    "use strict";

    var async = require('async'),
        Firebase = require('firebase'),
        ref,
        logger = require('tracer').console();

    ref = new Firebase('https://hacker-news.firebaseio.com/');

    function addItem(id, callback) {
        var childPath = 'v0/item/' + id;
        logger.info(childPath);
        function onItemChange (snapshot) {
            var val = snapshot.val();
            if (undefined === val || null === val) {
                return; // Wait until there is data
            }
            ref.child(childPath).off('value', onItemChange); // Stop listening for changes
            callback(null, val);
        }
        ref.child(childPath).on('value', onItemChange);
    }

    function listen(childPath, callback) {
        // Alert me of changes to v0/newstories
        ref.child(childPath).limitToFirst(1).on('value', function(snapshot) {
            async.map(snapshot.val(), addItem, callback);
        });
    }

    module.exports = {
        'listen': listen
    };

}());
