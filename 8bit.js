 var Op8 = function() {
   this.i8 = new Int8Array(1);
   this.u8 = new Uint8Array(this.i8.buffer);
}

Op8.prototype.toHex = function() {
  return zeropad(this.u8[0].toString(16), 2);
}

Op8.prototype.toOct = function() {
  return zeropad(this.u8[0].toString(8), 3);
}

Op8.prototype.toSDec = function() {
  return this.i8[0].toString(10);
}

Op8.prototype.toUDec = function() {
  return this.u8[0].toString(10);
}

Op8.prototype.toBin = function() {
  return zeropad(this.u8[0].toString(2), 8);
}
