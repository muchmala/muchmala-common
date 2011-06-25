var _ = require('underscore'),
    spawn = require('child_process').spawn;

var subprocesses = [];
process.on('SIGINT', cleanupBeforeExit);
process.on('SIGTERM', cleanupBeforeExit);

function cleanupBeforeExit() {
    subprocesses.forEach(function(subprocess) {
        console.log('Killing subprocess', subprocess.pid);
        subprocess.kill();
    });
    console.log('All subprocesses killed, exiting');
    process.exit(0);
}

function unsudo(args, options, callback) {
    if (process.env.SUDO_USER) {
        args = ['sudo', '-u', process.env.SUDO_USER].concat(args);
    }
    var command = args.shift();
    passthru(command, args, options, callback);
}
exports.unsudo = unsudo;

function passthru(command, args, options, callback) {
    if (_.isFunction(options)) {
        callback = options;
        options = {};
    }

    if (!_.isFunction(callback)) {
        callback = null;
    }

    if (_.isEmpty(options.customFds)) {
        // FIXME: find out why next line breaks things
        //options.customFds = [process.stdin, process.stdout, process.stderr];
    }

    options.env = process.env;

    var subprocess = spawn(command, args, options);
    subprocesses.push(subprocess);
    if (callback) {
        subprocess.on('exit', function() {
            subprocesses = _.without(subprocesses, subprocess);
            callback.apply(this, Array.prototype.slice.apply(arguments));
        });
    };

    if (subprocess.stdout) {
        subprocess.stdout.on('data', function (data) {
            process.stdout.write(data);
        });
    }

    if (subprocess.stderr) {
        subprocess.stderr.on('data', function (data) {
            process.stderr.write(data);
        });
    }
}
exports.passthru = passthru;
