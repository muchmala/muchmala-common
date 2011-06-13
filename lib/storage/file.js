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
    var srcPath = src;
    var dstPath = this._resolvePath(dst);

    createBaseDir(dstPath, 0755, function() {
        var writeStream, readStream;

        async.waterfall([function(callback) {
            writeStream = fs.createWriteStream(dstPath).on('open', function() {
                callback();
            });
        }, function(callback) {
            readStream = fs.createReadStream(srcPath).on('open', function() {
                callback();
            });
        }], function() {
            util.pump(readStream, writeStream, callback);
        });
    });
};

FileStorage.prototype.get = function(filePath, callback) {
    var self = this;

    this.exists(filePath, function(err, exists) {
        if (!exists) {
            return callback(new Error('File ' + filePath + ' does not exist in file storage.'));
        }

        callback(null, self._resolvePath(filePath));
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
                return callback(err);
            }

            callback(null, stats.isFile());
        });
    });
};

FileStorage.prototype.listDir = function(filePath, callback) {
    filePath = path.normalize('/' + filePath + '/');
    var realPath = this._resolvePath(filePath);

    fs.readdir(realPath, function(err, files) {
        if (err) {
            return callback(err);
        }

        var contents = {
            files: {},
            dirs: {}
        };

        files.forEach(function(obj) {
            var stats = fs.statSync(path.resolve(realPath, obj));
            if (stats.isDirectory()) {
                contents.dirs[obj] = {
                    path: path.resolve(filePath, obj)
                };
            } else {
                contents.files[obj] = {
                    path: path.resolve(filePath, obj),
                    change: new Date(stats.mtime),
                    size: stats.size
                };
            }
        });

        callback(null, contents);
    });
};

FileStorage.prototype._resolvePath = function(filePath) {
    filePath = path.normalize('/' + filePath).substr(1);
    return path.resolve(this._location, filePath);
};

function createBaseDir(filePath, mode, callback) {
    var baseDir = path.dirname(filePath);
    path.exists(baseDir, function(exists) {
        if (exists) {
            return callback();
        }

        createBaseDir(baseDir, mode, function(err) {
            fs.mkdir(baseDir, mode, callback);
        })
    });
}
