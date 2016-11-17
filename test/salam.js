'use strict';

const path = require('path');
const fs = require('fs');
const test = require('tape');
const salam = require('..');
const connect = require('./connect')('salam', salam);

test('salam: options: prefix', (t) => {
    connect('/', {prefix: 'hello'}, (socket, callback) => {
        socket.on('connect', () => {
            t.pass('connected with prefix');
            t.end();
            callback();
        });
    });
});

test('salam: options: root', (t) => {
    connect('/', {root: __dirname}, (socket, callback) => {
        socket.on('connect', () => {
            const name = String(Math.random());
            const full = path.join(__dirname, name);
            socket.emit('pack', '.', name, ['salam.js']);
            
            socket.on('end', () => {
                t.pass('should emit "end" event');
                fs.unlinkSync(full);
                t.end();
                callback();
            });
        });
    });
});

test('salam: options: empty object', (t) => {
    connect('/', {}, (socket, callback) => {
        socket.on('connect', () => {
            t.end();
            callback();
        });
    });
});

test('salam: options: authCheck not function', (t) => {
    const authCheck = {};
    const fn = () => {
        connect('/', {authCheck}, () => {
        });
    };
    
    t.throws(fn, /authCheck should be function!/, 'should throw when authCheck not function');
    t.end();
});

test('salam: options: authCheck: wrong credentials', (t) => {
    const authCheck = (socket, fn) => {
        socket.on('auth', (username, password) => {
            if (username === 'hello' && password === 'world')
                fn();
            else
                socket.emit('err', 'Wrong credentials');
        });
    };
    
    connect('/', {authCheck}, (socket, fn) => {
        socket.emit('auth', 'jhon', 'lajoie');
        
        socket.on('err', (error) => {
            t.equal(error, 'Wrong credentials', 'should return error');
            t.end();
            fn();
        });
    });
});

test('salam: options: authCheck: correct credentials', (t) => {
    const authCheck = (socket, fn) => {
        socket.on('auth', (username, password) => {
            if (username === 'hello' && password === 'world')
                fn();
            else
                socket.emit('err', 'Wrong credentials');
        });
    };
    
    connect('/', {authCheck}, (socket, fn) => {
        socket.emit('auth', 'hello', 'world');
        
        socket.on('connect', () => {
            t.pass('should grant access');
            t.end();
            fn();
        });
        
        socket.on('err', (error) => {
            t.notOk(error, 'should not be error');
        });
    });
});

