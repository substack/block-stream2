const test = require('tape')
const BlockStream = require('../')

const blockSizes = [16] //, 25]//, 1024]
const writeSizes = [4, 15, 16, 17, 64] //, 64, 100]
const writeCounts = [1, 10] //, 100]

writeCounts.forEach(writeCount => {
  blockSizes.forEach(blockSize => {
    writeSizes.forEach(writeSize => {
      test(`writeSize=${writeSize} blockSize=${blockSize} writeCount=${writeCount}`, t => {
        const f = new BlockStream(blockSize)

        let actualChunks = 0
        let actualBytes = 0
        let timeouts = 0

        f.on('data', c => {
          timeouts++

          actualChunks++
          actualBytes += c.length

          // make sure that no data gets corrupted, and basic sanity
          const before = c.toString()
          // simulate a slow write operation
          setTimeout(() => {
            timeouts--

            const after = c.toString()
            t.equal(after, before, 'should not change data')

            // now corrupt it, to find leaks.
            for (let i = 0; i < c.length; i++) {
              c[i] = 'x'.charCodeAt(0)
            }
          }, 100)
        })

        f.on('end', () => {
          // round up to the nearest block size
          const expectChunks = Math.ceil(writeSize * writeCount * 2 / blockSize)
          const expectBytes = expectChunks * blockSize
          t.equal(actualBytes, expectBytes,
            `bytes=${expectBytes} writeSize=${writeSize}`)
          t.equal(actualChunks, expectChunks,
            `chunks=${expectChunks} writeSize=${writeSize}`)

          // wait for all the timeout checks to finish, then end the test
          setTimeout(function WAIT () {
            if (timeouts > 0) return setTimeout(WAIT)
            t.end()
          }, 100)
        })

        for (let i = 0; i < writeCount; i++) {
          const a = Buffer.alloc(writeSize)
          for (let j = 0; j < writeSize; j++) a[j] = 'a'.charCodeAt(0)
          const b = Buffer.alloc(writeSize)
          for (let j = 0; j < writeSize; j++) b[j] = 'b'.charCodeAt(0)
          f.write(a)
          f.write(b)
        }
        f.end()
      })
    })
  })
})
