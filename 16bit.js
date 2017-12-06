// Constructor

 var Op16 = function() {
   this.i16 = new Int16Array(1);
   this.u16 = new Uint16Array(this.i16.buffer);
   this.i8 = new Int8Array(this.i16.buffer);
   this.u8 = new Uint8Array(this.i16.buffer);
}

/* String conversion routines.

   from<radix>
     Takes a string.
     Returns true if the parse was successful.
     Returns false if there was overflow or error.

   to<radix>
     Returns string.  */

Op16.prototype.fromHex = function(str) {
  var val = parseInt(str, 16);
  this.i16[0] = val;
  return (this.i16[0] == val || this.u16[0] == val);
}

Op16.prototype.toHex = function() {
  return zeropad(this.u16[0].toString(16), 4);
}

Op16.prototype.fromOct = function(str) {
  var val = parseInt(str, 8);
  this.i16[0] = val;
  return (this.i16[0] == val || this.u16[0] == val);
}

Op16.prototype.toOct = function() {
  return zeropad(this.u16[0].toString(8), 6);
}

Op16.prototype.fromSDec = function(str) {
  var val = parseInt(str, 10);
  this.i16[0] = val;
  return (this.i16[0] == val || this.u16[0] == val);
}

Op16.prototype.toSDec = function() {
  return this.i16[0].toString(10);
}

Op16.prototype.fromUDec = function(str) {
  var val = parseInt(str, 10);
  this.i16[0] = val;
  return (this.i16[0] == val || this.u16[0] == val);
}

Op16.prototype.toUDec = function() {
  return this.u16[0].toString(10);
}

Op16.prototype.fromBin = function(str) {
  var val = parseInt(str, 2);
  this.i16[0] = val;
  return (this.i16[0] == val || this.u16[0] == val);
}

Op16.prototype.toBin = function() {
  return zeropad(this.u16[0].toString(2), 16);
}
