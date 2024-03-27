const { join, delimiter } = require('bare-path')
const process = require('bare-process')
const { isWindows } = require('which-runtime')
const isExecutable = require('./lib/executable')

// The functions in this file are derived from
// https://github.com/npm/node-which/blob/main/lib/index.js,
// which is licensed under the ISC License.

const pathMatcher = isWindows ? /[/\\]/ : /\//
const relativePathMatcher = new RegExp(`^\\.${pathMatcher.source}`)

const isPath = (path) => pathMatcher.test(path)
const isRelative = (path) => relativePathMatcher.test(path)

class ErrorNotFound extends Error {
  constructor (command) {
    super(`Command not found: ${command}`)
    this.code = 'ENOENT'
  }
}

function getPathInfo (cmd, {
  path: optPath = process.env.PATH,
  pathExt: optPathExt = process.env.PATHEXT,
  delimiter: optDelimiter = delimiter
}) {
  const pathEnv = !isPath(cmd)
    ? [...(isWindows ? [process.cwd()] : []), ...(optPath || '').split(optDelimiter)]
    : ['']

  if (!isWindows) return { pathEnv, pathExt: [''] }

  const pathExtExe = optPathExt || ['.EXE', '.CMD', '.BAT', '.COM'].join(optDelimiter)
  const pathExt = pathExtExe.split(optDelimiter).flatMap(item => [item, item.toLowerCase()])

  if (cmd.includes('.') && pathExt[0] !== '') pathExt.unshift('')

  return { pathEnv, pathExt, pathExtExe }
}

function joinPathCommand (path, cmd) {
  const pathPart = /^".*"$/.test(path) ? path.slice(1, -1) : path
  const prefix = !pathPart && isRelative(cmd) ? cmd.slice(0, 2) : ''
  return prefix + join(pathPart, cmd)
}

function whichSync (cmd, options = {}) {
  const { pathEnv, pathExt, pathExtExe } = getPathInfo(cmd, options)

  const { all, nothrow } = options
  const found = []

  for (const pathEnvPart of pathEnv) {
    const pathCommand = joinPathCommand(pathEnvPart, cmd)

    for (const ext of pathExt) {
      const withExt = pathCommand + ext
      if (isExecutable.sync(withExt,
        { pathExt: pathExtExe, ignoreErrors: true })) {
        if (!all) return withExt

        found.push(withExt)
      }
    }
  }

  if (all && found.length) return found
  if (nothrow) return null

  throw new ErrorNotFound(cmd)
}

async function whichAsync (cmd, options = {}) {
  const { pathEnv, pathExt, pathExtExe } = getPathInfo(cmd, options)

  const { all, nothrow } = options
  const found = []

  for (const pathEnvPart of pathEnv) {
    const pathCommand = joinPathCommand(pathEnvPart, cmd)

    for (const ext of pathExt) {
      const withExt = pathCommand + ext
      if (await isExecutable(withExt,
        { pathExt: pathExtExe, ignoreErrors: true })) {
        if (!all) return withExt

        found.push(withExt)
      }
    }
  }

  if (all && found.length) return found
  if (nothrow) return null

  throw new ErrorNotFound(cmd)
}

whichAsync.sync = whichSync
module.exports = whichAsync
