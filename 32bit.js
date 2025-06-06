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

 var Op32 = function() {
   this.f32 = new Float32Array(1);
   this.i32 = new Int32Array(this.f32.buffer);
   this.i16 = new Int16Array(this.f32.buffer);
   this.i8 = new Int8Array(this.f32.buffer);
   this.u32 = new Uint32Array(this.f32.buffer);
   this.u16 = new Uint16Array(this.f32.buffer);
   this.u8 = new Uint8Array(this.f32.buffer);
}

Op32.prototype.size = 32;

Op32.prototype.valid_conversion = function(op, size) {
  if (op === "sext32" || op === "zext32")
    return size < 32;
  if (op === "trunc32")
    return size === 64;
  return false;
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
  if (/^inf$/i.test(val) || /^infinity/i.test(val))
    val = "Infinity";
  else if (/^-inf$/i.test(val) || /^-infinity/i.test(val))
    val = "-Infinity";
  else if (/^nan$/i.test(val))
    val = "NaN";
  this.f32[0] = parseFloat(val);
  return (this.toFloat() === val);
}

Op32.prototype.toFloat = function() {
  // Javascript outputs "0", not "-0", so do it ourselves
  if (this.f32[0] == 0.0 && this.u32[0] & 0x80000000)
    return "-0.0";

  var s = this.f32[0].toString();
  if (/^-?\d+$/.test(s))
    s += ".0";
  return s;
}

Op32.prototype.fromBin = function(str) {
  var val = parseInt(str, 2);
  this.i32[0] = val;
  return (this.i32[0] == val || this.u32[0] == val);
}

Op32.prototype.toBin = function() {
  return zeropad(this.u32[0].toString(2), 32);
}

/* Operator functions.
 
   Each function takes one or more Op32 values, and updates itself
   with the result.

   I.e.   this = otherA <op> otherB

          ***not***  this <op>= other

   Each function return "this", to allow composition.

   E.g. "v = ~a & b"
   
         v = new Op32.and(new Op32.not(a), b);

   However, each function must only update itself last, to allow
   self reference.

   E.g. the following will invert itself:
   
        this.not(this);

   It is also permissible to use non-Op32 constants (e.g. {u32: [1, 0]}),
   and conversion operators may take Op64, Op16, or Op8.

   The operators are in alphabetical order.  */

// Integer absolute value
Op32.prototype.abs = function(a) {
  this.i32[0] = Math.abs(a.i32[0]);
  return this;
};

// FP absolute value
Op32.prototype.absfp = function(a) {
  this.f32[0] = Math.abs(a.f32[0]);
  return this;
};

// Integer add
Op32.prototype.add = function(a, b) {
  this.u32[0] = a.u32[0] + b.u32[0];
  return this;
}

// FP add
Op32.prototype.addfp = function(a, b) {
  this.f32[0] = a.f32[0] + b.f32[0];
  return this;
}

// Bitwise and
Op32.prototype.and = function(a, b) {
  this.u32[0] = a.u32[0] & b.u32[0];
  return this;
}

// FP round up
Op32.prototype.ceilfp = function(a) {
  this.f32[0] = Math.ceil(a.f32[0]);
  return this;
}

// Integer signed divide
Op32.prototype.divide = function(a, b) {
  if (b.u32[0] === 0) this.warning = "Divide by zero!"
  this.i32[0] = a.i32[0] / b.i32[0];
  return this;
}

// FP divide
Op32.prototype.dividefp = function(a, b) {
  if (b.f32[0] === 0) this.warning = "Divide by zero!"
  this.f32[0] = a.f32[0] / b.f32[0];
  return this;
}

// FP round down
Op32.prototype.floorfp = function(a) {
  this.f32[0] = Math.floor(a.f32[0]);
  return this;
}

// Integer signed modulus
Op32.prototype.modulus = function(a, b) {
  if (b.u32[0] === 0) this.warning = "Divide by zero!"
  this.i32[0] = a.i32[0] % b.i32[0];
  return this;
}

// Integer multiply
Op32.prototype.multiply = function(a, b) {
  this.i32[0] = a.i32[0] * b.i32[0];
  return this;
}

// FP multiply
Op32.prototype.multiplyfp = function(a, b) {
  this.f32[0] = a.f32[0] * b.f32[0];
  return this;
}

// Integer two's complement negate
Op32.prototype.negate = function(a) {
  this.u32[0] = -a.u32[0];
  return this;
}

// FP negate
Op32.prototype.negatefp = function(a) {
  this.u32[0] = a.u32[0] ^ 0x80000000;
  return this;
}

// Bitwise not
Op32.prototype.not = function(a) {
  this.u32[0] = ~a.u32[0];
  return this;
}

// Bitwise or
Op32.prototype.or = function(a, b) {
  this.u32[0] = a.u32[0] | b.u32[0];
  return this;
}

// FP round to nearest
Op32.prototype.roundfp = function(a) {
  this.f32[0] = Math.round(a.f32[0]);
  return this;
}

// Integer sign extend
Op32.prototype.sext32 = function(a) {
  if (a.size === 16)
    this.i32[0] = a.i16[0];
  else
    this.i32[0] = a.i8[0];
  return this;
}

// Integer subtract
Op32.prototype.subtract = function(a, b) {
  this.u32[0] = a.u32[0] - b.u32[0];
  return this;
}

// FP subtract
Op32.prototype.subtractfp = function(a, b) {
  this.f32[0] = a.f32[0] - b.f32[0];
  return this;
}

// Truncate
Op32.prototype.trunc32 = function(a) {
  this.u32[0] = a.u32[0];
  return this;
}

// Integer unsigned divide
Op32.prototype.udivide = function(a, b) {
  if (b.u32[0] === 0) this.warning = "Divide by zero!"
  this.u32[0] = a.u32[0] / b.u32[0];
  return this;
}

// Integer unsigned modulus
Op32.prototype.umodulus = function(a, b) {
  if (b.u32[0] === 0) this.warning = "Divide by zero!"
  this.u32[0] = a.u32[0] % b.u32[0];
  return this;
}

// Bitwise xor
Op32.prototype.xor = function(a, b) {
  this.u32[0] = a.u32[0] ^ b.u32[0];
  return this;
}

// Integer zero extend
Op32.prototype.zext32 = function(a) {
  if (a.size === 16)
    this.u32[0] = a.u16[0];
  else
    this.u32[0] = a.u8[0];
  return this;
}

Op32.prototype.leftshift = function(a, b) {
  var bits = b.i32[0];
  if (bits < 0) {
    this.warning = "Negative shifts may be unsafe; assuming logical right shift";
    var pos_bits = -bits;
    if (pos_bits >= 32) {
      this.u32[0] = 0;
    } else {
      this.u32[0] = a.u32[0] >>> pos_bits;
    }
  } else if (bits >= 32) {
    this.warning = "Shifting more than 31 bits may be unsafe";
    this.u32[0] = 0;
  } else {
    this.u32[0] = a.u32[0] << bits;
  }
  return this;
};

Op32.prototype.rightshift = function(a, b) {
  var bits = b.i32[0];
  if (bits < 0) {
    this.warning = "Negative shifts may be unsafe; assuming logical left shift";
    var pos_bits = -bits;
    if (pos_bits >= 32) {
      this.u32[0] = 0;
    } else {
      this.u32[0] = a.u32[0] << pos_bits;
    }
  } else if (bits >= 32) {
    this.warning = "Shifting more than 31 bits may be unsafe";
    this.u32[0] = 0;
  } else {
    this.u32[0] = a.u32[0] >>> bits;
  }
  return this;
};

// Bitwise arithmetic right shift
Op32.prototype.arightshift = function(a, b) {
  var bits = b.i32[0];
  if (bits < 0) {
    this.warning = "Negative shifts may be unsafe; assuming logical left shift";
    var pos_bits = -bits;
    if (pos_bits >= 32) {
      this.u32[0] = 0;
    } else {
      this.u32[0] = a.u32[0] << pos_bits;
    }
  } else if (bits >= 32) {
    this.warning = "Shifting more than 31 bits may be unsafe";
    // Result is 0 if positive, -1 if negative
    this.i32[0] = (a.i32[0] < 0 ? -1 : 0);
  } else {
    this.i32[0] = a.i32[0] >> bits;
  }
  return this;
};
