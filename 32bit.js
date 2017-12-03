 var Op32 = function() {
   this.f32 = new Float32Array(1);
   this.i32 = new Int32Array(this.f32.buffer);
   this.i16 = new Int16Array(this.f32.buffer);
   this.i8 = new Int8Array(this.f32.buffer);
   this.u32 = new Uint32Array(this.f32.buffer);
   this.u16 = new Uint16Array(this.f32.buffer);
   this.u8 = new Uint8Array(this.f32.buffer);
}

Op32.prototype.toHex = function() {
  return zeropad(this.u32[0].toString(16), 8);
}

Op32.prototype.toOct = function() {
  return zeropad(this.u32[0].toString(8), 11);
}

Op32.prototype.toSDec = function() {
  return this.i32[0].toString(10);
}

Op32.prototype.toUDec = function() {
  return this.u32[0].toString(10);
}

Op32.prototype.toBin = function() {
  return zeropad(this.u32[0].toString(2), 32);
}
