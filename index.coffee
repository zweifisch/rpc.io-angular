calls = require('too-late')()

module.exports = ->

    genUuid = ->
        'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace /[xy]/g, (c)->
            r = Math.random() * 16 | 0
            v = if c == 'x' then r else r & 0x3 | 0x8
            v.toString 16

    angular.module('zf.rpc-io', []).provider 'rpcFactory', ->

        $get: ($rootScope, $timeout, $q)-> (socket, timeout, scope)->

            timeout ?= 5000
            socket ?= io()
            scope ?= $rootScope

            _on = socket.on.bind socket

            _on 'rpc-result', (id, result, err)->
                calls.deliver id, result: result, err: err

            socket.on = (event, callback)->
                _on event, (args...)->
                    scope.$apply ->
                        callback args...

            socket.call = (args...)->
                if args.length is 3
                    [method, params, callback] = args
                    throw new Error "params should be passed in the form of key:value" unless 'object' is typeof params
                if args.length is 2
                    if 'function' is typeof args[1]
                        [method, callback] = args
                        params = {}
                    else
                        [method, params] = args
                if args.length is 1
                    [method] = args
                    params = {}
                id = genUuid()
                socket.emit 'rpc-call', id, method, params
                deferred = $q.defer()
                calls.waitfor id, ({result, err})->
                    scope.$apply ->
                        if err
                            deferred.reject err
                        else
                            deferred.resolve result
                        callback? err, result
                .till timeout, ->
                    scope.$apply ->
                        deferred.reject 'timeout'
                        callback? 'timeout'
                deferred.promise

            socket
