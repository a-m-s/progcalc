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

/* Operator functions.
 
   Each function takes one or more Op8 values, and updates itself
   with the result.

   I.e.   this = otherA <op> otherB

          ***not***  this <op>= other

   Each function return "this", to allow composition.

   E.g. "v = ~a & b"
   
         v = new Op8.and(new Op8.not(a), b);

   However, each function must only update itself last, to allow
   self reference.

   E.g. the following will invert itself:
   
        this.not(this);

   It is also permissible to use non-Op8 constants (e.g. {u8: [1, 0]}),
   and conversion operators may take Op64, Op32, or Op16.

   The operators are in alphabetical order.  */

// Integer add
Op8.prototype.add = function(a, b) {
  this.u8[0] = a.u8[0] + b.u8[0];
  return this;
}