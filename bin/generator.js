#! /usr/bin/env node

var async = require('async'),
    logger = require('../lib/logger'),
    generator = require('../lib/generator');

var optimist = require('optimist')
    .usage('Usage: $0 <path/to/image> [-n "Puzzle Name"] [-x <num>] [-p] [-v]')

    .describe('n', 'Puzzle name. If not specified, file name will be used.')
    .alias('n', 'name')

    .describe('x', 'Size of a puzzle element.')
    .options('x', 'piecesize')

    .describe('p', 'Flag, marks puzzle as private.')
    .alias('p', 'private')
    .boolean('p')

    .describe('v', 'Flag, makes output verbose')
    .alias('v', 'verbose')
    .boolean('v')

    .describe('h', 'Prints this message')
    .alias('h', 'help')
    .boolean('h'),

    argv = optimist.argv;

function main() {
    if (argv.help) {
        printHelp();
    }

    if (!argv._.length) {
        console.error('You did not specify any image.\n');
        printHelp();
    }

    logger.setLevel(argv.verbose ? logger.debug : logger.warning);

    var options = {
        private: argv.private
    };

    if (argv.name) {
        options.name = qrgv.name;
    }

    if (argv.piecesize) {
        options.pieceSize = qrgv.piecesize;
    }

    generatePuzzles(argv._, options);
}

function printHelp() {
    optimist.showHelp(console.error);
    process.exit();
}

function generatePuzzles(images, options) {
    async.forEachSeries(images, function(image, callback) {
        generator.createPuzzle(image, options, function(err) {
            if (err) {
                logger.error("Failed to generate puzzle from image", image);
                logger.error(err);
            } else {
                logger.info('Image ' + image + ' processed');
            }

            callback();
        });
    }, function() {
        console.log('Done!');
    });
}




















main();



//addValidators([
//    getWidthValidator(800, 900),
//    getHeightValidator(120, 240)
//]);
//
//createPuzzle('lib/qwe.jpg', {}, function(err, metadata) {
//    if (err) {
//        logger.error(err);
//        return logger.error("Fatality!!!")
//    }
//
//    logger.info(metadata);
//});


//
//
//
//
//
//
//
//var PUZZLES_DIR = __dirname + '/../../client/img/puzzles/';
//
//var SUCCESS = 1;
//
//var ERROR_IMAGE_BIG = 101;
//var ERROR_IMAGE_SMALL = 102;
//
//var MAX_IMAGE_HEIGHT = 2500;
//var MAX_IMAGE_WIDTH = 2500;
//var MIN_IMAGE_HEIGHT = 500;
//var MIN_IMAGE_WIDTH = 500;
//
//
//var image = new Image();
//
//image.onerror = function(err) {
//    throw err;
//};
//
//image.onload = function() {
//
//    if (opts.get('validate')) {
//        if (image.width > MAX_IMAGE_WIDTH ||
//            image.height > MAX_IMAGE_HEIGHT) {
//            log('Image is too big :(');
//            process.exit(ERROR_IMAGE_BIG);
//        }
//        if (image.width < MIN_IMAGE_WIDTH ||
//            image.height < MIN_IMAGE_HEIGHT) {
//            log('Image is too small :(');
//            process.exit(ERROR_IMAGE_SMALL);
//        }
//    }
//
//    var options = {
//        name: opts.get('name'),
//        userId: opts.get('userid'),
//        invisible: opts.get('private'),
//        pieceSize: parseInt(opts.get('piecesize')),
//        spriteSize: parseInt(opts.get('spritesize'))
//    };
//
//    if (!options.name) {
//        options.name = path.basename(image.src, path.extname(image.src));
//    }
//
//    db.connect(function() {
//        log('Creating puzzle...');
//        generate(image, options, function(puzzleId, queueIndex) {
//            var result = {
//                puzzleId: puzzleId,
//                queueIndex: queueIndex
//            };
//
//            log('Sprites images are created.');
//            log('Queue index: ' + queueIndex);
//
//            if (!opts.get('verbose')) {
//                process.stdout.write(JSON.stringify(result));
//            }
//
//            process.exit(SUCCESS);
//        });
//    });
//};
//
//image.src = opts.get('image');
//
//function generate(image, options, callback) {
//    options.pieceSize || (options.pieceSize = 120);
//    options.invisible || (options.invisible = false);
//    options.spriteSize || (options.spriteSize = 5);
//
//    var puzzle = layout.createPuzzle(image.width, image.height, options.pieceSize);
//
//    options.hLength = puzzle.hLength;
//    options.vLength = puzzle.vLength;
//
//    db.Puzzles.add(puzzle.pieces, options, function(added, queueIndex) {
//        var puzzleId = added._id.toHexString();
//
//        log('Puzzle is created. Id: ' + puzzleId + '.');
//        log('Creating sprites images...');
//
//        cutter.createPieces({
//            image: image,
//            hLength: puzzle.hLength,
//            vLength: puzzle.vLength,
//            piecesMap: puzzle.pieces,
//            pieceSize: options.pieceSize,
//            spriteSize: options.spriteSize,
//            resultDir: PUZZLES_DIR + puzzleId,
//            verbose: opts.get('verbose'),
//            onFinish: function() {
//                callback(puzzleId, queueIndex);
//            }
//        });
//    });
//}
//
//function log(message) {
//    if (opts.get('verbose')) {
//        console.log(message);
//    }
//}
