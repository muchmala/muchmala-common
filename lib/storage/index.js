exports.createStorage = createStorage;

var storages = {
    s3: require('./s3').createStorage,
    file: require('./file').createStorage
};

function createStorage(type, options, callback) {
    if (!(type in storages)) {
        process.nextTick(function(){
            callback(new Error("Unsupported storage: " + type));
        });
        return;
    }

    storages[type](options, callback)
}
