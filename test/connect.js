'use strict';

const http = require('http');
const express = require('express');
const io = require('socket.io');
const ioClient = require('socket.io-client');

module.exports = (prefix, middle) => {
    return (path, options, fn) => {
        connect(prefix, middle, path, options, fn);
    };
};

function connect(defaultPrefix, middle, path, options, fn) {
    if (!path) {
        throw Error('path could not be empty!');
    } else if (!fn && !options) {
        fn = path;
        path = '';
    } else if (!fn) {
        fn = options;
        options = null;
    }
    
    path = path.replace(/^\/|\/$/g, '');
    
    if (!options || !options.prefix) {
        path = defaultPrefix;
    } else {
        const prefix = options.prefix || defaultPrefix;
        path = `${prefix}${!path ? '' : '/' + path}`;
    }
    
    const app = express();
    const server = http.createServer(app);
    
    app.use(middle(options));
    
    middle.listen(io(server), options);
    
    if (options && !Object.keys(options).length)
        options = undefined;
    
    server.listen(() => {
        const port = server.address().port;
        const url = `http://127.0.0.1:${port}/${path}`;
        const socket = ioClient(url);
        
        fn(socket, () => {
            socket.destroy();
            server.close();
        });
    });
}

