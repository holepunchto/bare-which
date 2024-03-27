# bare-which
Finds instances of an executable in PATH

Based on [node-which](https://github.com/npm/node-which) but ported for Bare

### Usage
```js
const which = require('bare-which')

// by default, returns the first instance of an executable in PATH
// rejects/throws if not found
await which('ping')
which.sync('ping')

// use nothrow option to return null if not found
await which('ping', { nothrow: true })
which.sync('ping', { nothrow: true })

// use path and pathExt to override PATH and PATHEXT
await which('ping', { path: someOtherPath, pathExt: somePathExt })
which.sync('ping', { path: someOtherPath, pathExt: somePathExt })

// use all option to return all matches as an array
await which('ping', { all: true })
which.sync('ping', { all: true })
```
