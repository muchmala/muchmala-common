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
        var result = null;
        
        if (image.width < minWidth) {
            result = {
                short: 'imageWidthSmall',
                message: 'Image has width less then ' + minWidth
            };
        }
        if (image.width > maxWidth) {
            result = {
                short: 'imageWidthBig',
                message: 'Image has width grater then ' + maxWidth
            };
        }
        callback(result);
    }
}

function getHeightValidator(minHeight, maxHeight) {
    return function(image, callback) {
        var result = null;
        
        if (image.height < minHeight) {
            result = {
                short: 'imageHeightSmall',
                message: 'Image has height less then ' + minHeight
            };
        }
        if (image.height > maxHeight) {
            result = {
                short: 'imageHeightBig',
                message: 'Image has height grater then ' + maxHeight
            };
        }
        callback(result);
    }
}

function createPuzzle(imagePath, options, callback) {
    if (_.isFunction(options)) {
        callback = options;
        options = {};
    }

    async.waterfall([
        function(callback) {
            loadImage(imagePath, callback);
        },
        function(image, callback) {
            validateImage(image, callback);
        },
        function(image, callback) {
            generatePieces(image, options, callback);
        }
    ], callback);
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
        resultDir: generateUniqueDirName('puzzle'),
        invisible: !!options.private,
        spriteSize: SPRITE_SIZE
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
    async.reduce(validators, [], 
        function(memo, validator, callback) {
            validator(image, function(error) {
                if (error) {
                    memo.push(error);
                }
                callback(null, memo);
            });
        }, 
        function(err, validationErrors){
            if (validationErrors.length) {
                callback({message:'validation errors', data: validationErrors});
                return;
            }
            callback(null, image);
        });
}

function generateUniqueDirName(prefix) {
    return OUTPUT_DIR + '/' + prefix + '-' + misc.getUniqueString();
}
