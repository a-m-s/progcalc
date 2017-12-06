// Constructor

 var Op32 = function() {
   this.f32 = new Float32Array(1);
   this.i32 = new Int32Array(this.f32.buffer);
   this.i16 = new Int16Array(this.f32.buffer);
   this.i8 = new Int8Array(this.f32.buffer);
   this.u32 = new Uint32Array(this.f32.buffer);
   this.u16 = new Uint16Array(this.f32.buffer);
   this.u8 = new Uint8Array(this.f32.buffer);
}

/* String conversion routines.

   from<radix>
     Takes a string.
     Returns true if the parse was successful.
     Returns false if there was overflow or error.

   to<radix>
     Returns string.  */

Op32.prototype.fromHex = function(str) {
  var val = parseInt(str, 16);
  this.i32[0] = val;
  return (this.i32[0] == val || this.u32[0] == val);
}

Op32.prototype.toHex = function() {
  return zeropad(this.u32[0].toString(16), 8);
}

Op32.prototype.fromOct = function(str) {
  var val = parseInt(str, 8);
  this.i32[0] = val;
  return (this.i32[0] == val || this.u32[0] == val);
}

Op32.prototype.toOct = function() {
  return zeropad(this.u32[0].toString(8), 11);
}

Op32.prototype.fromSDec = function(str) {
  var val = parseInt(str, 10);
  this.i32[0] = val;
  return (this.i32[0] == val || this.u32[0] == val);
}

Op32.prototype.toSDec = function() {
  return this.i32[0].toString(10);
}

Op32.prototype.fromUDec = function(str) {
  var val = parseInt(str, 10);
  this.i32[0] = val;
  return (this.i32[0] == val || this.u32[0] == val);
}

Op32.prototype.toUDec = function() {
  return this.u32[0].toString(10);
}

Op32.prototype.fromFloat = function(val) {
  this.f32[0] = val;
  return (this.f32[0] == val);
}

Op32.prototype.toFloat = function() {
  // Javascript outputs "0", not "-0", so do it ourselves
  if (this.f32[0] == 0.0 && this.u32[0] & 0x80000000)
    return "-0";

  return this.f32[0];
}

Op32.prototype.fromBin = function(str) {
  var val = parseInt(str, 2);
  this.i32[0] = val;
  return (this.i32[0] == val || this.u32[0] == val);
}

Op32.prototype.toBin = function() {
  return zeropad(this.u32[0].toString(2), 32);
}
