var path = require('path'),
    Image = require('canvas').Image,
    _ = require('underscore'),
    async = require('async'),
    cutter = require('./cutter'),
    layout = require('./layout'),
    logger = require('../logger'),
    misc = require('../misc');

exports.createPuzzle = createPuzzle;
exports.createCovers = createCovers;
exports.createFrame = createFrame;
exports.validators = {
    append: addValidators,
    getWidthValidator: getWidthValidator,
    getHeightValidator: getHeightValidator
};

var DEFAULT_PIECE_SIZE = 120;
var SPRITE_SIZE = 5;
var OUTPUT_DIR = '/tmp';

var validators = [];

function addValidators(newValidators) {
    Array.prototype.push.apply(validators, Array.prototype.concat(newValidators));
}

function getWidthValidator(minWidth, maxWidth) {
    return function(image, callback) {
        if (image.width < minWidth) {
            return callback('Image has width less then ' + minWidth);
        }

        if (image.width > maxWidth) {
            return callback('Image has width grater then ' + maxWidth);
        }

        callback(null);
    }
}

function getHeightValidator(minHeight, maxHeight) {
    return function(image, callback) {
        if (image.height < minHeight) {
            return callback('Image has height less then ' + minHeight);
        }

        if (image.height > maxHeight) {
            return callback('Image has height grater then ' + maxHeight);
        }

        callback(null);
    }
}

function createPuzzle(imagePath, options, callback) {
    if (_.isFunction(options)) {
        callback = options;
        options = {};
    }

    async.waterfall([function(callback) {
            loadImage(imagePath, callback);

        }, function(image, callback) {
            validateImage(image, callback);

        }, function(image, callback) {
            generatePieces(image, options, callback);

        }], callback);
}

function createCovers(size, callback) {
    var resultDir = generateUniqueDirName('covers');

    cutter.createCovers(size, resultDir, function() {
        callback(null, {size: size, resultDir: resultDir});
    });
}

function createFrame(size, callback) {
    var resultDir = generateUniqueDirName('frame');
    
    cutter.createFrame(size, resultDir, function() {
        callback(null, {size: size, resultDir: resultDir});
    });
}

function generatePieces(image, options, callback) {
    var metadata = {
        name: options.name || path.basename(image.src, path.extname(image.src)),
        pieceSize: options.pieceSize || DEFAULT_PIECE_SIZE,
        spriteSize: SPRITE_SIZE,
        invisible: !!options.private,
        resultDir: generateUniqueDirName('puzzle')
    };

    logger.info('Creating puzzle:', metadata);
    logger.debug(image.width, image.height);
    var puzzle = layout.createPuzzle(image.width, image.height, metadata.pieceSize);

    logger.info('Puzzle map created.');
    _.extend(metadata, {
        hLength: puzzle.hLength,
        vLength: puzzle.vLength,
        piecesMap: puzzle.pieces
    });

    cutter.createPieces(image, metadata, function() {
        logger.info('Sprites cut and saved.');
        callback(null, metadata);
    });
}

function loadImage(imagePath, callback) {
    var image = new Image();
    image.onerror = function(err) {
        callback(err);
    };

    image.onload = function() {
        callback(null, image);
    };

    image.src = imagePath;
}

function validateImage(image, callback) {
    async.reduce(validators, [], function(memo, validator, callback) {
        validator(image, function(err) {
            if (err) {
                memo.push(err);
            }

            callback(null, memo);
        });

    }, function(err, validationFails){
        if (validationFails.length) {
            return callback({message:'validation errors', data: validationFails});
        }

        callback(null, image);
    });
}

function generateUniqueDirName(prefix) {
    return OUTPUT_DIR + '/' + prefix + '-' + misc.getUniqueString();
}
