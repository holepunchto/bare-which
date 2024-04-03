const fs = require('fs')
const path = require('path')
const { isWindows } = require('which-runtime')

module.exports = function generateFixtures () {
  const fixtures = {
    executable: { content: '#!/bin/bash\necho "executable"', chmod: 0o755 },
    nonexecutable: { content: '#!/bin/bash\necho "nonexecutable"', chmod: 0o644 },
    shared: { content: '#!/bin/bash\necho "shared"', chmod: 0o755 }
  }

  const fixtureDir = path.resolve(__dirname, 'bin')
  const fixtureLocalDir = path.resolve(__dirname, 'local-bin')
  const fixturePaths = { _root: fixtureDir, _localRoot: fixtureLocalDir }

  if (!fs.existsSync(fixtureDir)) fs.mkdirSync(fixtureDir)
  if (!fs.existsSync(fixtureLocalDir)) fs.mkdirSync(fixtureLocalDir)

  for (const [name, { content, chmod }] of Object.entries(fixtures)) {
    const executable = chmod & 0o111
    const fileName = isWindows ? (executable ? `${name}.EXE` : `${name}.TXT`) : name
    const fixturePath = path.resolve(fixtureDir, fileName)

    fixturePaths[name] = fixturePath

    if (fs.existsSync(fixturePath)) continue

    fs.writeFileSync(fixturePath, content, 'utf8')
    fs.chmodSync(fixturePath, chmod)
  }

  const localBinShared = path.resolve(fixtureLocalDir, isWindows ? 'shared.EXE' : 'shared')
  fixturePaths.localShared = localBinShared

  if (!fs.existsSync(localBinShared)) {
    fs.writeFileSync(localBinShared, fixtures.executable.content, 'utf8')
    fs.chmodSync(localBinShared, fixtures.executable.chmod)
  }

  return fixturePaths
}
