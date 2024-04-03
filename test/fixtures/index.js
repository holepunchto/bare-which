const fs = require('bare-fs')
const path = require('bare-path')

module.exports = function generateFixtures () {
  const fixtures = {
    owned: { content: '#!/bin/bash\necho "mine"', chmod: 0o700 },
    groupowned: { content: '#!/bin/bash\necho "groupowned"', chmod: 0o770 },
    everyone: { content: '#!/bin/bash\necho "everyone"', chmod: 0o777 },
    noone: { content: '#!/bin/bash\necho "noone"', chmod: 0o000 },
    shared: { content: '#!/bin/bash\necho "shared"', chmod: 0o755 }
  }

  const fixtureDir = path.resolve(__dirname, 'bin')
  const fixtureLocalDir = path.resolve(__dirname, 'local-bin')
  const fixturePaths = { _root: fixtureDir, _localRoot: fixtureLocalDir }

  if (!fs.existsSync(fixtureDir)) fs.mkdirSync(fixtureDir)
  if (!fs.existsSync(fixtureLocalDir)) fs.mkdirSync(fixtureLocalDir)

  for (const [name, { content, chmod }] of Object.entries(fixtures)) {
    const fixturePath = path.resolve(fixtureDir, name)
    fixturePaths[name] = fixturePath

    if (fs.existsSync(fixturePath)) continue

    fs.writeFileSync(fixturePath, content, 'utf8')
    fs.chmodSync(fixturePath, chmod)
  }

  const localBinShared = path.resolve(fixtureLocalDir, 'shared')
  fixturePaths.localShared = localBinShared

  if (!fs.existsSync(localBinShared)) {
    fs.writeFileSync(localBinShared, fixtures.shared.content, 'utf8')
    fs.chmodSync(localBinShared, fixtures.shared.chmod)
  }

  return fixturePaths
}
