Muchmala-common
===============

This package contains all common stuff of Muchamla:
* database models
* puzzle generator
* puzzle storage
* logger
* some misc functions

## Documentation

### muchamlaCommon.db (database models)

Contains all Muchmala models and some helper methods.

#### connect(options, callback)

Establishes connection to mongoDB.

    options {
        user        (required)
        host        (required)
        database    (required)
    }

    callback(err)   function triggered when connection is established

Example

    var db = require('muchmala-common').db;

    db.connect({
        user:     "mongodb",
        host:     "127.0.0.1",
        database: "muchmala"
    }, function(err) {
        if (err) {
            console.error(err);
            return;
        }

        console.log("Connection is established");
    });

#### generateId()

Generates new ObjectId and returns it's string representation.

Example

    var db = require('muchmala-common').db;

    var newId = db.generateId();

#### Sessions

User sessions model

#### Puzzles

Puzzles model

#### Users

Users model

### muchamlaCommon.puzzleGenerator (puzzle generator)

Creates puzzle map and covers.

#### createPuzzle(imagePath, options, callback)

Generates puzzle map and sprites for puzzle from image imagePath

    imagePath       path to image
    options {
        name        (string,  optional) Name of the resulting puzzle. If this option is omitted, file name is taken.
        pieceSize   (integer, optional) Size of one tile in pixels. Default value is 120.
        private     (boolean, optional) If true, puzzle will not be present in general queue.
    }
    callback(err, metadata)   function triggered when all images are generated
        metadata {
            name         Puzzle name
            pieceSize    Size of one tile's size in pixels
            spriteSize   Size of sprite in pixels
            invisible    Flag, which shows if puzzle should pe present in general queue
            resultDir    Directory, where you can find all generated stuff
            hLength      ?
            vLength      ?
            piecesMap    Map which contains information about location of the pieces on the puzzle
        }

Example

    var puzzleGenerator = require('muchmala-common').puzzleGenerator;

    puzzleGenerator.createPuzzle('./img.png', {}, function(err, metadata) {
        if (err) {
            console.error(err);
            return;
        }

        console.log("Puzzle is created: " + metadata);
    });

#### createCovers(size, callback)

Creates three covers for puzzle of given size.

    size            integer, size of the side of tile in pixels
    callback(err, metadata)   function, triggered when covers are created
        metadata {
            size         Size of one tile's size in pixels
            resultDir    Directory, where you can find all generated stuff
        }

Example

    var puzzleGenerator = require('muchmala-common').puzzleGenerator;

    puzzleGenerator.createCovers(250, function(err, metadata) {
        if (err) {
            console.error(err);
            return;
        }

        console.log("Covers are created: " + metadata);
    });

#### validators.append(newValidator)

Appends new validator to validators list.
All the validators are executed after loading image. If one fails, image processing is stopped.

    newValidator(image, callback)    function. Accepts image(canvas) object as argument.
                                     Triggers callback with error if validation fails.

Example

    var puzzleGenerator = require('muchmala-common').puzzleGenerator;

    puzzleGenerator.validators.append(function(image, callback) {
        if (image.width != image.height) {
            return callback("Image is not of square form");
        }

        callback();
    });

#### validators.getWidthValidator(minWidth, maxWidth)

Returns validator to accept images only of given width.

    minWidth        integer
    maxWidth        integer

Example

    var puzzleGenerator = require('muchmala-common').puzzleGenerator;

    puzzleGenerator.validators.append(
        puzzleGenerator.validators.getWidthValidator(800, 1024);
    );

#### validators.getHeightValidator(minHeight, maxHeight)

Returns validator to accept images only of given height.

    minHeight       integer
    maxHeight       integer

Example

    var puzzleGenerator = require('muchmala-common').puzzleGenerator;

    puzzleGenerator.validators.append(
        puzzleGenerator.validators.getHeightValidator(800, 1024);
    );

### muchamlaCommon.storage (puzzle storage)

Abstraction layer over different types of storage (like file storage, amazon s3, etc)

#### createStorage(type, options, callback)

Factory. Creates storage of given type

    type       (string) [file|s3]
    options    (object) options for given storage
    callback(err, storage)    callback, triggered when storage is ready
        storage               instance of storage

        storage.put(src, dst, callback)  copies file into storage
            src              (string) path to file
            dst              (string) path to file in storage
            callback(err)    function, triggered when transaction is done

        storage.get(path, callback)      copies file from storage
            path             (string) path to file in storage
            callback(err, localFilePath)  function, triggered when transaction is done
                localFilePath   location of the file in local file system

        storage.exists(path, callback)   checks if file exists in storage
            path             (string) path to file in storage
            callback(err, exists)  function, triggered when check is done
                exists   boolean flag. If true, then file exists

        storage.listDir(path, callback)  lists directory
            path             (string) path to file in storage
            callback(err, contents)  function, triggered when check is done
                contents     object with files and folders under path in following format:
                            { files:
                               { 'qwe.jpg':
                                  { path: 'qwe.jpg',
                                    change: Wed, 01 Jun 2011 15:18:57 GMT,
                                    size: 279092 } },
                              dirs:
                               { asd: { path: 'asd/' },
                                 covers: { path: 'covers/' },
                                 puzzles: { path: 'puzzles/' } } }


Example

    var storage = require('muchmala-common').storage;

    storage.createStorage('s3', {
        key: 'alkjsdfalksdjfnlaskdjfasldkfj',
        secret: 'adkfjnadfkjnflksjdnfaksdjnfalskjdfn',
        bucket: 'static.dev.muchmala.com'
    }, function(err, storage) {
        if (err) {
            console.error(err);
            return;
        }

        storage.exists('/some/path/some-file.qwe', function(err, exists) {
            if (exists) {
                console.log('file exists');
            } else {
                console.log('file does not exists');
            }
        });
    });

### muchamlaCommon.logger

Logger with option of setting log level.

#### setLevel(level)

Sets logging level

    level        (function|integer|string)
                 0 == 'DEBUG'   == logger.debug
                 1 == 'INFO'    == logger.info
                 2 == 'WARNING' == logger.warning
                 3 == 'ERROR'   == logger.error

Example

    var logger = require('muchmala-common').logger;

    logger.setLevel(logger.info);

    logger.debug('debug'); //not printed
    logger.info('info'); //is printed
    logger.warning('warning'); //is printed
    logger.error('error'); //is printed

#### debug(var[,var[, ...]])
#### info(var[,var[, ...]])
#### warning(var[,var[, ...]])
#### error(var[,var[, ...]])

### muchamlaCommon.misc (some misc functions)

#### deepExtend(object1, object2)

Extends object1 with object2

Example

    var a = {
        1: {
            x: 1,
            y: 2
        },
        2: 'xy'
    };

    require('muchmala-common').misc.deepExtend(a, {
        1: {
            y: 100
        }
    });

    console.log(a);

    //var a = {
    //    1: {
    //        x: 1,
    //        y: 100
    //    },
    //    2: 'xy'
    //};


#### getUniqueString()

Returns unique string