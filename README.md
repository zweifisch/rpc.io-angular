# rpc.io agular

usage see [rpc.io](https://github.com/zweifisch/rpc.io)

```coffeescript
require('rpc.io-angular')()

angular.module('app', [ 'zf.rpc-io' ])
.factory 'rpc', (rpcFactory)->
	rpc = rpcFactory()
```
