#!/usr/bin/env node

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