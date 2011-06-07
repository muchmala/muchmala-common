var rq = require('rq');

exports.Adapter = Adapter;

function Adapter(options) {
    var rqOptions = {
        REDIS_HOST: options.host,
        REDIS_PORT: options.port,
        REDIS_PASSWORD: options.password,
        REDIS_DATABASE: options.database
    };

    this.listener = rq.getListener(rqOptions);
    this.publisher = rq.getPublisher(rqOptions);
}

Adapter.prototype.subscribe = function(channelName, callback) {
    this.listener.subscribe(channelName, callback);
};

Adapter.prototype.publish = function(channelName, message) {
    this.publisher.publish(channelName, message);
};

Adapter.prototype.broadcast = function(channelName, message) {
    this.publisher.broadcast(channelName, message);
};