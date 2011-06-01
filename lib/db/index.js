var models = require('./models');
var mongoose = require('mongoose');
var Sessions = require('./sessions');
var Puzzles = require('./puzzles');
var Users = require('./users');

module.exports = {
    connect: function(options, callback) {
        mongoose.connect(options.user + '://' +
                         options.host + '/' +
                         options.database,
            function(err) {
                if (err) {
                    callback(err);
                }
            });
        mongoose.connection.on('open', function() {
            callback.call(null);
        });
    },

    Sessions: Sessions,
    Puzzles: Puzzles,
    Users: Users
};
