var fs = require('fs'),
    path = require('path'),
    util = require('util'),
    knox = require('knox'),
    async = require('async');

exports.createStorage = createStorage;

var TEMPORARY_STORAGE = '/tmp';

function createStorage(options, callback) {
    process.nextTick(function() {
        callback(null, new FileStorage(options.location));
    });
}

function FileStorage(location) {
    this._location = path.resolve(location);
}

FileStorage.prototype.put = function(src, dst, callback) {
    var srcPath = this._resolvePath(src);
    var dstPath = this._resolvePath(dst);

    async.parallel([function(callback) {
        var stream = fs.createWriteStream(dstPath).on('open', function() {
            callback(null, stream);
        });
    }, function(callback) {
        var stream = fs.createReadStream(srcPath).on('open', function() {
            callback(null, stream);
        });
    }], function(err, streams) {
        util.pump(streams[1], streams[0], callback);
    });
};

FileStorage.prototype.get = function(filePath, callback) {
    var self = this;

    this.exists(filePath, function(err, exists) {
        if (!exists) {
            return callback(new Error('File ' + filePath + ' does not exist in file storage.'));
        }

        callback(self._resolvePath(filePath));
    });
};

FileStorage.prototype.exists = function(filePath, callback) {
    var realPath = this._resolvePath(filePath);

    path.exists(realPath, function(exists) {
        if (!exists) {
            return callback(null, exists);
        }

        fs.stat(realPath, function(err, stats) {
            if (err) {
                callback(err);
            }

            callback(null, stats.isFile());
        });
    });
};

FileStorage.prototype._resolvePath = function(filePath) {
    var filePath = path.normalize('/' + filePath).substr(1);
    return path.resolve(this._location, filePath);
};
