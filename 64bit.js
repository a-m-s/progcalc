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

var Op64 = function() {
  this.f64 = new Float64Array(1);
  this.f32 = new Float32Array(this.f64.buffer);
  this.i32 = new Int32Array(this.f64.buffer);
  this.i16 = new Int16Array(this.f64.buffer);
  this.i8 = new Int8Array(this.f64.buffer);
  this.u32 = new Uint32Array(this.f64.buffer);
  this.u16 = new Uint16Array(this.f64.buffer);
  this.u8 = new Uint8Array(this.f64.buffer);
  this.f64[0] = 0;
}

Op64.prototype.size = 64;

Op64.prototype.copy = function(o) {
  this.u32[0] = o.u32[0];
  this.u32[1] = o.u32[1];
  return this;
}

Op64.prototype.valid_conversion = function(op, size) {
  if (op === "sext64" || op === "zext64")
    return size < 64;
  return false;
}

/* String conversion routines.

   from<radix>
     Takes a string.
     Returns true if the parse was successful.
     Returns false if there was overflow or error.

   to<radix>
     Returns string.  */

Op64.prototype.fromHex = function(str) {
  this.u32[0] = 0;
  this.u32[1] = 0;
  var i = 0;
  var neg = false;
  var bits = 0;

  // Skip leading whitespace
  while (str[i] && /\s/.test(str[i]))
    i++;
  if (!str[i])
    return false;

  // Minus sign?
  if (str[i] == '-') {
    neg = true;
    i++;
  }

  // Read numbers
  while (str[i] && /[0-9a-fA-F]/.test(str[i])) {
    this.leftshift(this, {i32: [4, 0]});
    bits += 4;

    if (/[0-9]/.test(str[i])) {
      this.add(this, {u32: [str.charCodeAt(i) - 48, 0]});
    } else if (/[a-f]/.test(str[i])) {
      this.add(this, {u32: [str.charCodeAt(i) - 97 + 10, 0]});
    } else if (/[A-F]/.test(str[i])) {
      this.add(this, {u32: [str.charCodeAt(i) - 65 + 10, 0]});
    }
    i++;
  }

  if (neg)
    this.negate(this);

  return bits <= 64;
}

Op64.prototype.toHex = function() {
  return (zeropad(this.u32[1].toString(16), 8)
          + zeropad(this.u32[0].toString(16), 8));
}

Op64.prototype.fromOct = function(str) {
  this.u32[0] = 0;
  this.u32[1] = 0;
  var i = 0;
  var neg = false;
  var bits = 0;

  // Skip leading whitespace
  while (str[i] && /\s/.test(str[i]))
    i++;
  if (!str[i])
    return false;

  // Minus sign?
  if (str[i] == '-') {
    neg = true;
    i++;
  }

  // Read numbers
  while (str[i] && /[0-7]/.test(str[i])) {
    this.leftshift(this, {i32: [3, 0]});
    bits += 3;

    this.add(this, {u32: [str.charCodeAt(i) - 48, 0]});
    i++;
  }

  if (neg)
    this.negate(this);

  return bits <= 64;
}

Op64.prototype.toOct = function() {
  return (zeropad((this.u32[1] >>> 1).toString(8), 11)
          + (((this.u32[1] & 1) << 2) | (this.u32[0] >>> 30)).toString(8)
          + zeropad((this.u32[0] & 07777777777).toString(8), 10));
}

Op64.prototype.fromSDec = function(str) {
  this.u32[0] = 0;
  this.u32[1] = 0;
  var i = 0;
  var neg = false;

  // Skip leading whitespace
  while (str[i] && /\s/.test(str[i]))
    i++;
  if (!str[i])
    return false;

  // Minus sign?
  if (str[i] == '-') {
    neg = true;
    i++;
  }

  // Read numbers
  while (str[i] && /[0-9]/.test(str[i])) {
    this.multiply(this, {u32: [10, 0]});
    this.add(this, {u32: [str.charCodeAt(i) - 48, 0]});
    i++;
  }

  if (neg)
    this.negate(this);

  return (this.toSDec() === str);
}

Op64.prototype.toSDec = function() {
  var sign = !!(this.u32[1] & 0x80000000);
  var magnitude = new Op64();
  if (sign) {
    magnitude.negate(this);
  } else {
    magnitude.u32[0] = this.u32[0];
    magnitude.u32[1] = this.u32[1];
  }

  return (sign ? "-" : "") + magnitude.toUDec();
}

Op64.prototype.fromUDec = function(str) {
  this.fromSDec(str);
  return (this.toUDec() === str);
}

Op64.prototype.toUDec = function() {
  // Javascript can print the bottom 53 bits, but not more ...
  var output = (((this.u32[1] & 0x1FFFFF) * 0x100000000)
                + this.u32[0]).toString(10);

  // We need to add in the rest ourselves, one bit at a time.
  // Javascript can't even generate these numbers reliably.
  var powers = [
    "9007199254740992", // 2^53
    "18014398509481984", // 2^54
    "36028797018963968", // 2^55
    "72057594037927936", // 2^56
    "144115188075855872", // 2^57
    "288230376151711744", // 2^58
    "576460752303423488", // 2^59
    "1152921504606846976", // 2^60
    "2305843009213693952", // 2^61
    "4611686018427387904", // 2^62
    "9223372036854775808" // 2^63
  ];
  for (var n = 53; n < 64; n++) {
    // if bit n is zero then there's nothing to do
    if ((this.u32[1] & (1 << (n-32))) == 0)
      continue;

    var lo = output;
    var hi = powers[n-53];

    // This is a simple decimal addition, one column at a time
    var i = lo.length-1;
    var j = hi.length-1;
    var carry = 0;
    output = "";
    for (; i >= 0 || j >= 0; i--, j--) {
      // '0'..'9' is charCode 48..58
      var lo_digit = (i >= 0 ? lo.charCodeAt(i) - 48 : 0);
      var hi_digit = (j >= 0 ? hi.charCodeAt(j) - 48 : 0);

      // Add column
      var sum = lo_digit + hi_digit + carry;
      carry = sum > 9 ? 1 : 0;
      sum %= 10;

      // Convert back to string
      output = String.fromCharCode((sum + 48)) + output;
    }
    if (carry)
      output = "1" + output;
  }
  return output;
}

Op64.prototype.fromFloat = function(val) {
  if (/^inf$/i.test(val) || /^infinity/i.test(val))
    val = "Infinity";
  else if (/^-inf$/i.test(val) || /^-infinity/i.test(val))
    val = "-Infinity";
  else if (/^nan$/i.test(val))
    val = "NaN";
  this.f64[0] = parseFloat(val);
  return (this.toFloat() === val);
}

Op64.prototype.toFloat = function() {
  // Javascript outputs "0", not "-0", so do it ourselves
  if (this.f64[0] == 0.0 && this.u32[1] & 0x80000000)
    return "-0.0";

  var s = this.f64[0].toString();
  if (/^-?\d+$/.test(s))
    s += ".0";
  return s;
}

Op64.prototype.fromBin = function(str) {
  this.u32[0] = 0;
  this.u32[1] = 0;
  var i = 0;
  var neg = false;
  var bits = 0;

  // Skip leading whitespace
  while (str[i] && /\s/.test(str[i]))
    i++;
  if (!str[i])
    return false;

  // Minus sign?
  if (str[i] == '-') {
    neg = true;
    i++;
  }

  // Read numbers
  while (str[i] && /[0-1]/.test(str[i])) {
    this.leftshift(this, {i32: [1, 0]});
    bits += 1;

    this.add(this, {u32: [str.charCodeAt(i) - 48, 0]});
    i++;
  }

  if (neg)
    this.negate(this);

  return bits <= 64;
}

Op64.prototype.toBin = function() {
  return (zeropad(this.u32[1].toString(2), 32)
          + zeropad(this.u32[0].toString(2), 32));
}

/* Helper functions.  */

function udiv64(a, b) {
  // This long division algorithm is taken straight from wikipedia.
  // https://en.wikipedia.org/wiki/Division_algorithm
  // I've unrolled the high and low word loops to keep the array
  // and bit indices simple to read.

  var quotient = new Op64();
  var remainder = new Op64();

  // High word
  for (var i=31; i>=0; i--) {
    remainder.leftshift(remainder, {i32: [1, 0]});
    if (a.u32[1] & (1 << i))
      remainder.u32[0] |= 1;
    if (remainder.u32[1] > b.u32[1]
        || (remainder.u32[1] == b.u32[1]
	    && remainder.u32[0] >= b.u32[0])) {
      remainder.subtract(remainder, b);
      quotient.u32[1] |= (1 << i);
    }
  }

  // Low word
  for (var i=31; i>=0; i--) {
    remainder.leftshift(remainder, {i32: [1, 0]});
    if (a.u32[0] & (1 << i))
      remainder.u32[0] |= 1;
    if (remainder.u32[1] > b.u32[1]
        || (remainder.u32[1] == b.u32[1]
	    && remainder.u32[0] >= b.u32[0])) {
      remainder.subtract(remainder, b);
      quotient.u32[0] |= (1 << i);
    }
  }

  return {quotient: quotient, remainder: remainder};
}

/* Operator functions.
 
   Each function takes one or more Op64 values, and updates itself
   with the result.

   I.e.   this = otherA <op> otherB

          ***not***  this <op>= other

   Each function return "this", to allow composition.

   E.g. "v = ~a & b"
   
         v = new Op64.and(new Op64.not(a), b);

   However, each function must only update itself last, to allow
   self reference.

   E.g. the following will invert itself:
   
        this.not(this);

   It is also permissible to use non-Op64 constants (e.g. {u32: [1, 0]}),
   and conversion operators may take Op32, Op16, or Op8.

   The operators are in alphabetical order.  */

// Integer absolute value
Op64.prototype.abs = function(a) {
  // Check the sign bit (most significant bit of the high word)
  var sign = !!(a.u32[1] & 0x80000000);

  if (sign) {
    // If negative, negate the number
    this.negate(a);
  } else {
    // If non-negative, just copy the value
    this.copy(a);
  }
  return this;
};

// FP absolute value
Op64.prototype.absfp = function(a) {
  this.f64[0] = Math.abs(a.f64[0]);
  return this;
};

// Integer add
Op64.prototype.add = function(a, b) {
  var lo = a.u32[0] + b.u32[0];
  var carry = (lo / 0x100000000) & 1;
  var hi = a.u32[1] + b.u32[1] + carry;
  this.u32[0] = lo;
  this.u32[1] = hi;
  return this;
}

// FP add
Op64.prototype.addfp = function(a, b) {
  this.f64[0] = a.f64[0] + b.f64[0];
  return this;
}

// Bitwise and
Op64.prototype.and = function(a, b) {
  this.u32[0] = a.u32[0] & b.u32[0];
  this.u32[1] = a.u32[1] & b.u32[1];
  return this;
}

// Bitwise right shift
Op64.prototype.arightshift = function(a, b) {
  var bits = b.i32[0];
  if (bits < 0) {
    this.warning = "Negative shifts may be unsafe";
    return this.leftshift(a, {i32: [-b.i32[0], 0]});
  }
  if (bits > 63)
    this.warning = "Shifting more than 63 bits may be unsafe";

  if (bits == 0) {
    this.u32[0] = a.u32[0];
    this.u32[1] = a.u32[1];
  } else if (bits < 32) {
    this.u32[1] = (a.i32[1] >> bits);
    this.u32[0] = (a.u32[0] >>> bits) | (a.u32[1] << (32-bits));
  } else if (bits < 64) {
    this.u32[1] = (a.u32[1] & 0x80000000
		   ? 0xffffffff
		   : 0);
    this.u32[0] = (a.i32[1] >> (bits-32));
  } else if (a.u32[1] & 0x80000000) {
    this.u32[0] = 0xffffffff;
    this.u32[1] = 0xffffffff;
  } else {
    this.u32[0] = 0;
    this.u32[1] = 0;
  }
  return this;
}

// FP round up
Op64.prototype.ceilfp = function(a) {
  this.f64[0] = Math.ceil(a.f64[0]);
  return this;
}

// Integer signed divide
Op64.prototype.divide = function(a, b) {
  if (b.u32[0] == 0 && b.u32[1] == 0) {
    this.warning = "Divide by zero!"
    this.f64[0] = 0;
    return this;
  }

  var A = new Op64().copy(a);
  var B = new Op64().copy(b);

  if (a.u32[1] & 0x80000000)
    A.negate(a);
  if (b.u32[1] & 0x80000000)
    B.negate(b);

  var res = udiv64(A, B);

  if ((a.u32[1] & 0x80000000 || b.u32[1] & 0x80000000)
      && (a.u32[1] & 0x80000000) != (b.u32[1] & 0x80000000))
    res.quotient.negate(res.quotient);

  this.u32[0] = res.quotient.u32[0];
  this.u32[1] = res.quotient.u32[1];
  return this;
}

// FP divide
Op64.prototype.dividefp = function(a, b) {
  this.f64[0] = a.f64[0] / b.f64[0];
  return this;
}

// FP round down
Op64.prototype.floorfp = function(a) {
  this.f64[0] = Math.floor(a.f64[0]);
  return this;
}

// Bitwise left shift
Op64.prototype.leftshift = function(a, b) {
  var bits = b.i32[0];
  if (bits < 0) {
    this.warning = "Negative shifts may be unsafe; assuming logical right shift";
    return this.rightshift(a, {i32: [-b.i32[0], 0]});
  }
  if (bits > 63)
    this.warning = "Shifting more than 63 bits may be unsafe";

  if (bits == 0) {
    this.u32[0] = a.u32[0];
    this.u32[1] = a.u32[1];
  } else if (bits < 32) {
    this.u32[1] = (a.u32[1] << bits) | (a.u32[0] >>> (32-bits));
    this.u32[0] = (a.u32[0] << bits);
  } else if (bits < 64) {
    this.u32[1] = (a.u32[0] << (bits-32));
    this.u32[0] = 0;
  } else {
    this.u32[0] = 0;
    this.u32[1] = 0;
  }
  return this;
}

// Integer signed modulus
Op64.prototype.modulus = function(a, b) {
  if (b.u32[0] == 0 && b.u32[1] == 0) {
    this.warning = "Divide by zero!"
    this.f64[0] = 0;
    return this;
  }

  var A = new Op64().copy(a);
  var B = new Op64().copy(b);

  if (a.u32[1] & 0x80000000)
    A.negate(a);
  if (b.u32[1] & 0x80000000)
    B.negate(b);

  var res = udiv64(A, B);

  if (a.u32[1] & 0x80000000)
    res.remainder.negate(res.remainder);

  this.u32[0] = res.remainder.u32[0];
  this.u32[1] = res.remainder.u32[1];
  return this;
}

// Integer multiply
Op64.prototype.multiply = function(a, b) {
  var product = new Op64();
  for (var i=0; i<32; i++) {
    if (a.u32[0] & (1<<i))
      product.add(product, new Op64().leftshift(b, {i32: [i, 0]}));
  }
  for (var i=0; i<32; i++) {
    if (a.u32[1] & (1<<i))
      product.add(product, new Op64().leftshift(b, {i32: [i+32, 0]}));
  }
  this.u32[0] = product.u32[0];
  this.u32[1] = product.u32[1];
  return this;
}

// FP multiply
Op64.prototype.multiplyfp = function(a, b) {
  this.f64[0] = a.f64[0] * b.f64[0];
  return this;
}

// Integer two's complement negate
Op64.prototype.negate = function(a) {
  var not_a = new Op64().not(a);
  this.add(not_a, {u32: [1, 0]});
  return this;
}

// FP negate
Op64.prototype.negatefp = function(a) {
  this.u32[1] = a.u32[1] ^ 0x80000000;
  return this;
}

// Bitwise not
Op64.prototype.not = function(a) {
  this.u32[0] = ~a.u32[0];
  this.u32[1] = ~a.u32[1];
  return this;
}

// Bitwise or
Op64.prototype.or = function(a, b) {
  this.u32[0] = a.u32[0] | b.u32[0];
  this.u32[1] = a.u32[1] | b.u32[1];
  return this;
}

// Bitwise right shift
Op64.prototype.rightshift = function(a, b) {
  var bits = b.i32[0];
  if (bits < 0) {
    this.warning = "Negative shifts may be unsafe";
    return this.leftshift(a, {i32: [-b.i32[0], 0]});
  }
  if (bits > 63)
    this.warning = "Shifting more than 63 bits may be unsafe";

  if (bits == 0) {
    this.u32[0] = a.u32[0];
    this.u32[1] = a.u32[1];
  } else if (bits < 32) {
    this.u32[1] = (a.u32[1] >>> bits);
    this.u32[0] = (a.u32[0] >>> bits) | (a.u32[1] << (32-bits));
  } else if (bits < 64) {
    this.u32[1] = 0;
    this.u32[0] = (a.u32[1] >>> (bits-32));
  } else {
    this.u32[0] = 0;
    this.u32[1] = 0;
  }
  return this;
}

// FP round to nearest
Op64.prototype.roundfp = function(a) {
  this.f64[0] = Math.round(a.f64[0]);
  return this;
}

// Integer sign extend
Op64.prototype.sext64 = function(a) {
  if (a.size === 32)
    this.i32[0] = a.i32[0];
  else if (a.size === 16)
    this.i32[0] = a.i16[0];
  else
    this.i32[0] = a.i8[0];
  this.i32[1] = (this.u32[0] & 0x80000000 ? -1 : 0);
  return this;
}

// Integer subtract
Op64.prototype.subtract = function(a, b) {
  var negb = new Op64().negate(b);
  return this.add(a, negb);
}

// FP subtract
Op64.prototype.subtractfp = function(a, b) {
  this.f64[0] = a.f64[0] - b.f64[0];
  return this;
}

// Integer unsigned divide
Op64.prototype.udivide = function(a, b) {
  if (b.u32[0] == 0 && b.u32[1] == 0) {
    this.warning = "Divide by zero!"
    this.f64[0] = 0;
    return this;
  }

  var res = udiv64(a, b);
  this.u32[0] = res.quotient.u32[0];
  this.u32[1] = res.quotient.u32[1];
  return this;
}

// Integer unsigned modulus
Op64.prototype.umodulus = function(a, b) {
  if (b.u32[0] == 0 && b.u32[1] == 0) {
    this.warning = "Divide by zero!"
    this.f64[0] = 0;
    return this;
  }

  var res = udiv64(a, b);
  this.u32[0] = res.remainder.u32[0];
  this.u32[1] = res.remainder.u32[1];
  return this;
}

// Bitwise xor
Op64.prototype.xor = function(a, b) {
  this.u32[0] = a.u32[0] ^ b.u32[0];
  this.u32[1] = a.u32[1] ^ b.u32[1];
  return this;
}

// Integer zero extend
Op64.prototype.zext64 = function(a) {
  if (a.size === 32)
    this.u32[0] = a.u32[0];
  else if (a.size === 16)
    this.u32[0] = a.u16[0];
  else
    this.u32[0] = a.u8[0];
  this.u32[1] = 0;
  return this;
}
