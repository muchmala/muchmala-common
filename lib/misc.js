exports.deepExtend = deepExtend;
exports.getUniqueString = getUniqueString;

function deepExtend(first, second) {
    for (var i in second) {
        if ('object' == typeof first[i] && first[i] !== null) {
            deepExtend(first[i], second[i]);
        } else {
            first[i] = second[i];
        }
    }
}

function getUniqueString() {
    return Math.random().toString().substring(2);
}