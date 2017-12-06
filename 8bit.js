// Constructor

var Op8 = function() {
   this.i8 = new Int8Array(1);
   this.u8 = new Uint8Array(this.i8.buffer);
}

/* String conversion routines.

   from<radix>
     Takes a string.
     Returns true if the parse was successful.
     Returns false if there was overflow or error.

   to<radix>
     Returns string.  */

Op8.prototype.fromHex = function(str) {
  var val = parseInt(str, 16);
  this.i8[0] = val;
  return (this.i8[0] == val || this.u8[0] == val);
}

Op8.prototype.toHex = function() {
  return zeropad(this.u8[0].toString(16), 2);
}

Op8.prototype.fromOct = function(str) {
  var val = parseInt(str, 8);
  this.i8[0] = val;
  return (this.i8[0] == val || this.u8[0] == val);
}

Op8.prototype.toOct = function() {
  return zeropad(this.u8[0].toString(8), 3);
}

Op8.prototype.fromSDec = function(str) {
  var val = parseInt(str, 10);
  this.i8[0] = val;
  return (this.i8[0] == val || this.u8[0] == val);
}

Op8.prototype.toSDec = function() {
  return this.i8[0].toString(10);
}

Op8.prototype.fromUDec = function(str) {
  var val = parseInt(str, 10);
  this.i8[0] = val;
  return (this.i8[0] == val || this.u8[0] == val);
}

Op8.prototype.toUDec = function() {
  return this.u8[0].toString(10);
}

Op8.prototype.fromBin = function(str) {
  var val = parseInt(str, 2);
  this.i8[0] = val;
  return (this.i8[0] == val || this.u8[0] == val);
}

Op8.prototype.toBin = function() {
  return zeropad(this.u8[0].toString(2), 8);
}
