// Generated by CoffeeScript 1.9.2
(function() {
  var calls,
    slice = [].slice;

  calls = require('too-late')();

  module.exports = function() {
    var genUuid;
    genUuid = function() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r, v;
        r = Math.random() * 16 | 0;
        v = c === 'x' ? r : r & 0x3 | 0x8;
        return v.toString(16);
      });
    };
    return angular.module('zf.rpc-io', []).provider('rpcFactory', function() {
      return {
        $get: function($rootScope, $timeout, $q) {
          return function(socket, timeout, scope) {
            var _on;
            if (timeout == null) {
              timeout = 5000;
            }
            if (socket == null) {
              socket = io();
            }
            if (scope == null) {
              scope = $rootScope;
            }
            _on = socket.on.bind(socket);
            _on('rpc-result', function(id, result, err) {
              return calls.deliver(id, {
                result: result,
                err: err
              });
            });
            socket.on = function(event, callback) {
              return _on(event, function() {
                var args;
                args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
                return scope.$apply(function() {
                  return callback.apply(null, args);
                });
              });
            };
            socket.call = function() {
              var args, callback, deferred, id, method, params;
              args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
              if (args.length === 3) {
                method = args[0], params = args[1], callback = args[2];
                if ('object' !== typeof params) {
                  throw new Error("params should be passed in the form of key:value");
                }
              }
              if (args.length === 2) {
                if ('function' === typeof args[1]) {
                  method = args[0], callback = args[1];
                  params = {};
                } else {
                  method = args[0], params = args[1];
                }
              }
              if (args.length === 1) {
                method = args[0];
                params = {};
              }
              id = genUuid();
              socket.emit('rpc-call', id, method, params);
              deferred = $q.defer();
              calls.waitfor(id, function(arg) {
                var err, result;
                result = arg.result, err = arg.err;
                return scope.$apply(function() {
                  if (err) {
                    deferred.reject(err);
                  } else {
                    deferred.resolve(result);
                  }
                  return typeof callback === "function" ? callback(err, result) : void 0;
                });
              }).till(timeout, function() {
                return scope.$apply(function() {
                  deferred.reject({
                    method: method,
                    message: 'timeout',
                    params: params,
                    thrower: 'rpc.io-angular'
                  });
                  return typeof callback === "function" ? callback(new Error({
                    method: method,
                    message: 'timeout',
                    params: params,
                    thrower: 'rpc.io-angular'
                  })) : void 0;
                });
              });
              return deferred.promise;
            };
            return socket;
          };
        }
      };
    });
  };

}).call(this);
