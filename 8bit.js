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

// Bitwise and
Op8.prototype.and = function(a, b) {
  this.u8[0] = a.u8[0] & b.u8[0];
  return this;
}

// Integer signed divide
Op8.prototype.divide = function(a, b) {
  if (b.u8[0] === 0) this.warning = "Divide by zero!"
  this.i8[0] = a.i8[0] / b.i8[0];
  return this;
}

// Integer signed modulus
Op8.prototype.modulus = function(a, b) {
  if (b.u8[0] === 0) this.warning = "Divide by zero!"
  this.i8[0] = a.i8[0] % b.i8[0];
  return this;
}

// Integer multiply
Op8.prototype.multiply = function(a, b) {
  this.u8[0] = a.u8[0] * b.u8[0];
  return this;
}

// Integer two's complement negate
Op8.prototype.negate = function(a) {
  this.u8[0] = -a.u8[0];
  return this;
}

// Bitwise not
Op8.prototype.not = function(a) {
  this.u8[0] = ~a.u8[0];
  return this;
}

// Bitwise or
Op8.prototype.or = function(a, b) {
  this.u8[0] = a.u8[0] | b.u8[0];
  return this;
}

// Integer subtract
Op8.prototype.subtract = function(a, b) {
  this.u8[0] = a.u8[0] - b.u8[0];
  return this;
}

// Integer unsigned divide
Op8.prototype.udivide = function(a, b) {
  if (b.u8[0] === 0) this.warning = "Divide by zero!"
  this.u8[0] = a.u8[0] / b.u8[0];
  return this;
}

// Integer unsigned modulus
Op8.prototype.umodulus = function(a, b) {
  if (b.u8[0] === 0) this.warning = "Divide by zero!"
  this.u8[0] = a.u8[0] % b.u8[0];
  return this;
}

// Bitwise xor
Op8.prototype.xor = function(a, b) {
  this.u8[0] = a.u8[0] ^ b.u8[0];
  return this;
}
