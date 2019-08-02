const test = require('tape')
const BlockStream = require('../')

test('basic test', t => {
  const b = new BlockStream(16)
  const fs = require('fs')
  const fstr = fs.createReadStream(__filename, { encoding: 'utf8' })
  fstr.pipe(b)
  b.resume()

  let stat
  t.doesNotThrow(() => {
    stat = fs.statSync(__filename)
  }, 'stat should not throw')

  let totalBytes = 0
  b.on('data', c => {
    t.equal(c.length, 16, 'chunks should be 16 bytes long')
    t.ok(Buffer.isBuffer(c), 'chunks should be buffer objects')
    totalBytes += c.length
  })
  b.on('end', () => {
    const expectedBytes = stat.size + (16 - stat.size % 16)
    t.equal(totalBytes, expectedBytes, 'Should be multiple of 16')
    t.end()
  })
})
