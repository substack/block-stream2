const BlockStream = require('../')
const test = require('tape')

test("don't pad, small writes", t => {
  const f = new BlockStream(16, { nopad: true })
  t.plan(1)

  f.on('data', c => {
    t.equal(c.toString(), 'abc', "should get 'abc'")
  })

  f.on('end', () => { t.end() })

  f.write(Buffer.from('a'))
  f.write(Buffer.from('b'))
  f.write(Buffer.from('c'))
  f.end()
})

test("don't pad, exact write", t => {
  const f = new BlockStream(16, { nopad: true })
  t.plan(1)

  let first = true
  f.on('data', c => {
    if (first) {
      first = false
      t.equal(c.toString(), 'abcdefghijklmnop', 'first chunk')
    } else {
      t.fail('should only get one')
    }
  })

  f.on('end', () => { t.end() })

  f.end(Buffer.from('abcdefghijklmnop'))
})

test("don't pad, big write", t => {
  const f = new BlockStream(16, { nopad: true })
  t.plan(2)

  let first = true
  f.on('data', c => {
    if (first) {
      first = false
      t.equal(c.toString(), 'abcdefghijklmnop', 'first chunk')
    } else {
      t.equal(c.toString(), 'q')
    }
  })

  f.on('end', () => { t.end() })

  f.end(Buffer.from('abcdefghijklmnopq'))
})
