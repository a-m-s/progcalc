 var Op16 = function() {
   this.i16 = new Int16Array(1);
   this.u16 = new Uint16Array(this.i16.buffer);
   this.i8 = new Int8Array(this.i16.buffer);
   this.u8 = new Uint8Array(this.i16.buffer);
}

Op16.prototype.toHex = function() {
  return zeropad(this.u16[0].toString(16), 4);
}

Op16.prototype.toOct = function() {
  return zeropad(this.u16[0].toString(8), 6);
}

Op16.prototype.toSDec = function() {
  return this.i16[0].toString(10);
}

Op16.prototype.toUDec = function() {
  return this.u16[0].toString(10);
}

Op16.prototype.toBin = function() {
  return zeropad(this.u16[0].toString(2), 16);
}
