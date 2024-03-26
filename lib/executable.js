const fs = require('bare-fs')
const os = require('bare-os')
const process = require('bare-process')

module.exports = function isExecutable (path, options) {
  try {
    const stat = fs.statSync(path)
    const checker = os.platform() === 'win32'
      ? isWin32Executable
      : isPosixExecutable

    return stat.isFile() && checker({ stat, options, path })
  } catch (err) {
    if (options.ignoreErrors ||
      ['ENOENT', 'EACCES'].includes(err.code)) return false
    throw err
  }
}

function isWin32Executable ({ stat, options }) {
  const { pathExt = process.env.PATHEXT || '' } = options
  const exts = pathExt.split(';')

  if (exts.includes('')) return true

  const fileName = stat.name.toLowerCase()
  return exts.some(ext => fileName.endsWith(ext.toLowerCase()))
}

function isPosixExecutable ({ path }) {
  fs.accessSync(path, fs.constants.X_OK)
  return true
}
