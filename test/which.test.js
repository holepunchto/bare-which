const test = require('brittle')
const { delimiter } = require('bare-path')
const which = require('../')
const initFixtures = require('./fixtures')
const { isWindows } = require('which-runtime')

const pathExt = isWindows ? '.EXE;.BAT' : ''
const suffix = isWindows ? '.EXE' : ''

test('which', (t) => {
  const unlikelyToExist = 'this-command-should-not-exist-anywhere'
  const fixtures = initFixtures()
  const path = [fixtures._root, fixtures._localRoot].join(delimiter)

  t.test('command not found', async (t) => {
    await t.test('throws', async t => {
      await t.exception(async () => which(unlikelyToExist), 'should reject when not found')
      t.exception(() => which.sync(unlikelyToExist), 'should throw when not found')
    })

    await t.test('nothrow', async t => {
      t.is(await which(unlikelyToExist, { nothrow: true }), null)
      t.is(which.sync(unlikelyToExist, { nothrow: true }), null)
    })
  })

  t.test('does not find non-executable', async (t) => {
    await t.test('absolute', async (t) => {
      await t.is(await which(fixtures.nonexecutable, { path: '', pathExt, nothrow: true }), null)
      t.is(which.sync(fixtures.nonexecutable, { path: '', pathExt, nothrow: true }), null)
    })

    await t.test('in path', async (t) => {
      await t.is(await which(`nonexecutable${suffix}`, { path, pathExt, nothrow: true }), null)
      t.is(which.sync(`nonexecutable${suffix}`, { path, pathExt, nothrow: true }), null)
    })
  })

  t.test('find when executable', async t => {
    await t.test('absolute', async (t) => {
      await t.is(await which(fixtures.executable, { path: '', pathExt, nothrow: true }), fixtures.executable)
      t.is(which.sync(fixtures.executable, { path: '', pathExt, nothrow: true }), fixtures.executable)
    })

    await t.test('in path', async (t) => {
      await t.is(await which(`executable${suffix}`, { path, pathExt, nothrow: true }), fixtures.executable)
      t.is(which.sync(`executable${suffix}`, { path, pathExt, nothrow: true }), fixtures.executable)
    })
  })

  t.test('find all', async t => {
    await t.test('absolute', async (t) => {
      await t.alike(await which(fixtures.shared, { path, pathExt, all: true, nothrow: true }), [fixtures.shared])
      t.alike(which.sync(fixtures.shared, { path, pathExt, all: true, nothrow: true }), [fixtures.shared])
    })

    await t.test('in path', async (t) => {
      await t.alike(await which(`shared${suffix}`, { path, pathExt, all: true, nothrow: true }), [fixtures.shared, fixtures.localShared])
      t.alike(which.sync(`shared${suffix}`, { path, pathExt, all: true, nothrow: true }), [fixtures.shared, fixtures.localShared])
    })
  })
})
