var inherits = require('inherits');
var Transform = require('readable-stream').Transform;

module.exports = Block;
inherits(Block, Transform);

function Block (opts) {
    if (!(this instanceof Block)) return new Block(opts);
    Transform.call(this);
    if (!opts) opts = {};
    if (typeof opts === 'number') opts = { size: opts }
    if (typeof opts === 'string') opts = { size: Number(opts) }
    this.size = opts.size || 512;
    this._zeroPadding = Boolean(opts.zeroPadding);
    
    this._buffered = [];
    this._bufferedBytes = 0;
}

Block.prototype._transform = function (buf, enc, next) {
    this._bufferedBytes += buf.length;
    this._buffered.push(buf);
    
    while (this._bufferedBytes >= this.size) {
        var b = Buffer.concat(this._buffered);
        this._bufferedBytes -= this.size;
        this.push(b.slice(0, this.size));
        this._buffered = [ b.slice(this.size, b.length) ];
    }
    next();
};

Block.prototype._flush = function () {
    if (this._bufferedBytes && this._zeroPadding) {
        var zeroes = new Buffer(this.size - this._bufferedBytes);
        zeroes.fill(0);
        this._buffered.push(zeroes);
        this.push(Buffer.concat(this._buffered));
        this._buffered = null;
    }
    else if (this._bufferedBytes) {
        this.push(Buffer.concat(this._buffered));
        this._buffered = null;
    }
    this.push(null);
};
