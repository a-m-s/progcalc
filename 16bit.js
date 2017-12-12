/*  Copyright (C) 2017  Andrew Stubbs

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published
    by the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

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

/* Operator functions.
 
   Each function takes one or more Op16 values, and updates itself
   with the result.

   I.e.   this = otherA <op> otherB

          ***not***  this <op>= other

   Each function return "this", to allow composition.

   E.g. "v = ~a & b"
   
         v = new Op16.and(new Op16.not(a), b);

   However, each function must only update itself last, to allow
   self reference.

   E.g. the following will invert itself:
   
        this.not(this);

   It is also permissible to use non-Op16 constants (e.g. {u16: [1, 0]}),
   and conversion operators may take Op64, Op32, or Op8.

   The operators are in alphabetical order.  */

// Integer add
Op16.prototype.add = function(a, b) {
  this.u16[0] = a.u16[0] + b.u16[0];
  return this;
}

// Integer divide
Op16.prototype.divide = function(a, b) {
  this.u16[0] = a.u16[0] / b.u16[0];
  return this;
}

// Integer multiply
Op16.prototype.multiply = function(a, b) {
  this.u16[0] = a.u16[0] * b.u16[0];
  return this;
}

// Integer two's complement negate
Op16.prototype.negate = function(a) {
  this.u16[0] = -a.u16[0];
  return this;
}

// Integer subtract
Op16.prototype.subtract = function(a, b) {
  this.u16[0] = a.u16[0] - b.u16[0];
  return this;
}
