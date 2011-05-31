var util = require('util');

var LOG_LEVELS = [
    'DEBUG',
    'INFO',
    'WARNING',
    'ERROR'
];

var LOG_LEVEL = 0;
var INSPECT_DEPTH = 2;
var INSPECT_HIDDEN_KEYS = false;

function log(level, data) {
    if (LOG_LEVELS.indexOf(level) < LOG_LEVEL) {
        return;
    }

    print(formatMessage(level, inspectData(data)));
}

function inspectData(data) {
    var inspectedData = '';
    for (var i = 0, cnt = data.length; i < cnt; ++i) {
        inspectedData += (('string' == typeof data[i]) ? data[i] : util.inspect(data[i], INSPECT_HIDDEN_KEYS, INSPECT_DEPTH)) + ' ';
    }

    return inspectedData;
}

function formatMessage(levelName, message) {
    return levelName + ': ' + message;
}

function print(string) {
    util.log(string);
}

function setLevel(level) {
    if ('function' == typeof level) {
        level = level.name.toUpperCase();
    } else if (LOG_LEVELS[level]) {
        level = LOG_LEVELS[level];
    }

    var newLevel = LOG_LEVELS.indexOf(level);
    return LOG_LEVEL = (newLevel == -1)? LOG_LEVEL : newLevel;
}

exports.setLevel = setLevel;
exports.log = log;
for (var i in LOG_LEVELS) {
    exports[LOG_LEVELS[i].toLowerCase()] = (new Function('return function ' + LOG_LEVELS[i] + '(){this.log("' + LOG_LEVELS[i] + '", Array.prototype.slice.call(arguments))};'))();
}