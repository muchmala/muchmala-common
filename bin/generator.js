var opts = require('opts');

var options = [
    {
        'short': 'i',
        'long': 'image',
        'description': 'Image a puzzle will be created from',
        'value': true,
        'required': true
    }, {
        'short': 'n',
        'long': 'name',
        'description': 'Puzzle name',
        'value': true
    }, {
        'short': 'ps',
        'long': 'piecesize',
        'description': 'Piece size',
        'value': true
    }, {
        'short': 'ss',
        'long': 'spritesize',
        'description': 'Sprite size',
        'value': true
    }, {
        'short': 'p',
        'long': 'private',
        'description': 'Is puzzle private',
        'value': false
    }, {
        'short': 'u',
        'long': 'userid',
        'description': 'User Id',
        'value': true
    }, {
        'short': 'v',
        'long': 'validate',
        'description': 'Use image validation',
        'value': false
    }, {
        'short': 'vr',
        'long': 'verbose',
        'description': 'Verbose output',
        'value': false
    }
];

opts.parse(options, true);

console.log("Hello world");
