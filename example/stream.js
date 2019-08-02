const through = require('through2')
const BlockStream = require('../')

process.stdin
  .pipe(new BlockStream({ size: 16, zeroPadding: true }))
  .pipe(through((buf, enc, next) => {
    const str = buf.toString().replace(/[\x00-\x1f]/g, chr)
    console.log(`buf[${buf.length}]=${str}`)
    next()
  }))

function chr (s) { return `\\x${pad(s.charCodeAt(0).toString(16), 2)}` }
function pad (s, n) { return Array(n - s.length + 1).join('0') + s }
