(function () {
    "use strict";

    var exphbs = require('express-handlebars'),
        moment = require('moment');

    function configureHandlebars(app) {
        var hbs;
        // Configure handlebars template engine to work with moment
        hbs = exphbs.create({
            helpers: {
                formatDate: function (datetime, format) {
                    return moment(datetime).format(format);
                }
            }
        });

        // Configure express to use handlebars
        app.engine('handlebars', hbs.engine);
        app.set('view engine', 'handlebars');
    }

    module.exports = configureHandlebars;

}());
