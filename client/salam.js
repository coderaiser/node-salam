'use strict';

const Emitify = require('emitify/legacy');

module.exports = (prefix, socketPath, callback) => {
    if (!callback) {
        if (!socketPath) {
            callback    = prefix;
            prefix      = '/salam';
        } else {
            callback    = socketPath;
            socketPath  = '';
        }
    }
    
    socketPath += '/socket.io';
    
    init();
    
    loadSocket((io) => {
        window.io = window.io || io;
        callback(Salam(prefix, socketPath));
    });
}

function loadSocket(fn) {
    const {io} = window;
    
    if (io)
        return fn(io);
    
    import('socket.io-client').then(fn);
}

function Salam(prefix, socketPath) {
    if (!(this instanceof Salam))
        return new Salam(prefix, socketPath);
    
    Emitify.call(this);
    this._progress = ProgressProto(prefix, socketPath, this);
}

function init() {
    Salam.prototype = Object.create(Emitify.prototype);
    
    Salam.prototype.pack = function(from, to, files) {
        this._progress.pack(from, to, files);
    };
    
    Salam.prototype.extract = function(from, to, files) {
        this._progress.extract(from, to, files);
    };
    
    Salam.prototype.abort = function() {
        this._progress.abort();
    };
    
    Salam.prototype.pause = function() {
        this._progress.pause();
    };
    
    Salam.prototype.continue   = function() {
        this._progress.continue();
    };
}

function ProgressProto(room, socketPath, salam) {
    const href = getHost();
    const FIVE_SECONDS = 5000;
    
    if (!(this instanceof ProgressProto))
        return new ProgressProto(room, socketPath, salam);
    
    const socket = connect(href + room, {
        'max reconnection attempts' : Math.pow(2, 32),
        'reconnection limit'        : FIVE_SECONDS,
        path                        : socketPath
    });
    
    salam.on('auth', (username, password) => {
        socket.emit('auth', username, password);
    });
    
    socket.on('accept', () => {
        salam.emit('accept');
    });
    
    socket.on('reject', () => {
        salam.emit('reject');
    });
    
    socket.on('err', (error) => {
        salam.emit('error', error);
    });
    
    socket.on('file', (name) => {
        salam.emit('file', name);
    });
    
    socket.on('progress', (percent) => {
        salam.emit('progress', percent);
    });
    
    socket.on('end', () => {
        salam.emit('end');
    });
    
    socket.on('connect', () => {
        salam.emit('connect');
    });
    
    socket.on('disconnect', () => {
        salam.emit('disconnect');
    });
    
    this.pause = () => {
        socket.emit('pause');
    };
    
    this.continue = () => {
        socket.emit('continue');
    };
    
    this.abort = () => {
        socket.emit('abort');
    };
    
    this.pack = (from, to, files) => {
        socket.emit('pack', from, to, files);
    };
    
    this.extract = (from, to) => {
        socket.emit('extract', from, to);
    };
    
    function getHost() {
        const l = location;
        const href = l.origin || l.protocol + '//' + l.host;
        
        return href;
    }
}

