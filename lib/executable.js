const fs = require('fs')
const process = require('process')
const { isWindows } = require('which-runtime')

function isExecutableSync (path, options) {
  try {
    const stat = fs.statSync(path)
    const checker = isWindows ? isWin32Executable : isPosixExecutableSync

    return stat.isFile() && checker({ path, options })
  } catch (err) {
    if (options.ignoreErrors ||
      ['ENOENT', 'EACCES'].includes(err.code)) return false
    throw err
  }
}

async function isExecutable (path, options) {
  try {
    const stat = await fs.promises.stat(path)
    const checker = isWindows ? isWin32Executable : isPosixExecutable

    return stat.isFile() && await checker({ path, options })
  } catch (err) {
    if (options.ignoreErrors ||
      ['ENOENT', 'EACCES'].includes(err.code)) return false
    throw err
  }
}

function isWin32Executable ({ path, options }) {
  const { pathExt = process.env.PATHEXT || '' } = options
  const exts = pathExt.split(';')

  if (exts.includes('')) return true

  return exts.some(ext => path.toLowerCase().endsWith(ext.toLowerCase()))
}

async function isPosixExecutable ({ path }) {
  await fs.promises.access(path, fs.constants.X_OK)
  return true
}

function isPosixExecutableSync ({ path }) {
  fs.accessSync(path, fs.constants.X_OK)
  return true
}

isExecutable.sync = isExecutableSync
module.exports = isExecutable
