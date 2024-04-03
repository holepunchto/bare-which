const test = require('brittle')
const { delimiter } = require('bare-path')
const which = require('../')
const initFixtures = require('./fixtures')

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
      await t.is(await which(fixtures.noone, { path: '', nothrow: true }), null)
      t.is(which.sync(fixtures.noone, { path: '', nothrow: true }), null)
    })

    await t.test('in path', async (t) => {
      await t.is(await which('noone', { path, nothrow: true }), null)
      t.is(which.sync('noone', { path, nothrow: true }), null)
    })
  })

  t.test('find when executable', async t => {
    await t.test('absolute', async (t) => {
      await t.is(await which(fixtures.owned, { path: '', nothrow: true }), fixtures.owned)
      t.is(which.sync(fixtures.owned, { path: '', nothrow: true }), fixtures.owned)
    })

    await t.test('in path', async (t) => {
      await t.is(await which('owned', { path, nothrow: true }), fixtures.owned)
      t.is(which.sync('owned', { path, nothrow: true }), fixtures.owned)
    })
  })

  t.test('find all', async t => {
    await t.test('absolute', async (t) => {
      await t.alike(await which(fixtures.shared, { path, all: true, nothrow: true }), [fixtures.shared])
      t.alike(which.sync(fixtures.shared, { path, all: true, nothrow: true }), [fixtures.shared])
    })

    await t.test('in path', async (t) => {
      await t.alike(await which('shared', { path, all: true, nothrow: true }), [fixtures.shared, fixtures.localShared])
      t.alike(which.sync('shared', { path, all: true, nothrow: true }), [fixtures.shared, fixtures.localShared])
    })
  })
})
