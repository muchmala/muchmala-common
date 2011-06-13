var fs = require('fs'),
    path = require('path'),
    url = require('url'),
    knox = require('knox'),
    async = require('async'),
    xml2js = require("xml2js"),
    misc = require('../misc');

exports.createStorage = createStorage;

var TEMPORARY_STORAGE = '/tmp';

function createStorage(options, callback) {
    process.nextTick(function() {
        callback(null, new S3Storage(knox.createClient(options)));
    });
}

function S3Storage(knoxClient) {
    this._knoxClient = knoxClient;
}

S3Storage.prototype.put = function(src, dst, callback) {
    this._knoxClient.putFile(src, dst, function(err, res) {
        if (err) {
            return callback(err);
        }

        if (res.statusCode != 200) {
            var message = 'PUT Failed!\n';
            message += 'HTTP ' + res.statusCode + '\n';
            message += JSON.stringify(res.headers);
            return callback(new Error(message));
        }

        callback(null);
    });
};

S3Storage.prototype.get = function(filePath, callback) {
    var self = this;
    var dirName = generateUniqueDirName();
    var localFilePath = dirName + '/' + path.basename(filePath);
    var file;

    async.waterfall([function(callback) {
        fs.mkdir(dirName, 0777, callback);

    }, function(callback) {
        file = fs.createWriteStream(localFilePath).on('open', function(fd) {
            callback();
        });

    }, function(callback) {
        self._knoxClient.getFile(filePath, function(err, res){
            if (err) {
                callback(err);
            }

            res.setEncoding('binary');

            res.on('data', function(data) {
                file.write(data, 'binary');
            });

            res.on('end', callback);
        });

    }], function(err) {
        if (file) {
            file.end();
        }

        if (err) {
            return callback(err);
        }

        callback(null, localFilePath);
    });
};

S3Storage.prototype.exists = function(filePath, callback) {
    this._knoxClient.getFile(filePath, function(err, res){
        if (err) {
            callback(err);
        }

        callback(null, res.statusCode == 200);
    });
};

S3Storage.prototype.listDir = function(filePath, callback) {
    filePath = path.normalize('/' + filePath + '/').substr(1);
    this._knoxClient.get(url.format({
        pathname: '/',
        query: {
            delimiter: '/',
            prefix: filePath
        }
    })).on('response', function(res){
        if (res.statusCode != 200) {
            var message = 'LIST Failed!\n';
            message += 'HTTP ' + res.statusCode + '\n';
            message += JSON.stringify(res.headers);
            return callback(new Error(message));
        }

        res.setEncoding('utf8');

        var parser = new xml2js.Parser();
        parser.addListener('end', function(result) {
            var files = (result.Contents) ? Array.prototype.concat(result.Contents) : [];
            var dirs =  (result.CommonPrefixes) ? Array.prototype.concat(result.CommonPrefixes) : [];
            var prefixLength = filePath.length;

            var contents = {
                files: {},
                dirs: {}
            };

            files.forEach(function(file) {
                contents.files[file.Key.slice(prefixLength)] = {
                    path: file.Key,
                    change: new Date(file.LastModified),
                    size: +file.Size
                };
            });
            dirs.forEach(function(dir) {
                contents.dirs[dir.Prefix.slice(prefixLength, -1)] = {
                    path: dir.Prefix
                };
            });

            callback(null, contents);
        });

        var response = '';
        res.on('data', function(chunk){
            response += chunk;
        });

        res.on('end', function() {
            parser.parseString(response);
        });
    }).end();
};


function generateUniqueDirName() {
    return TEMPORARY_STORAGE + '/get-' + misc.getUniqueString();
}
