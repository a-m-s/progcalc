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
  if (/[-+]/.test(str[i])) {
    neg = (str[i] == '-');
    i++;
  }

  // Read numbers
  while (str[i] && /[0-9a-fA-F]/.test(str[i])) {
    this.leftshift(this, 4);
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
    this.neg(this);

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
  if (/[-+]/.test(str[i])) {
    neg = (str[i] == '-');
    i++;
  }

  // Read numbers
  while (str[i] && /[0-7]/.test(str[i])) {
    this.leftshift(this, 3);
    bits += 3;

    this.add(this, {u32: [str.charCodeAt(i) - 48, 0]});
    i++;
  }

  if (neg)
    this.neg(this);

  return bits <= 64;
}

Op64.prototype.toOct = function() {
  return (zeropad((this.u32[1] >>> 2).toString(8), 10)
          + (((this.u32[1] & 3) << 1) | (this.u32[0] >>> 31)).toString(8)
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
  if (/[-+]/.test(str[i])) {
    neg = (str[i] == '-');
    i++;
  }

  // Read numbers
  while (str[i] && /[0-9]/.test(str[i])) {
    this.multiply(this, {u32: [10, 0]});
    this.add(this, {u32: [str.charCodeAt(i) - 48, 0]});
    i++;
  }

  if (neg)
    this.neg(this);

  return (this.toSDec() === str);
}

Op64.prototype.toSDec = function() {
  var sign = !!(this.u32[1] & 0x80000000);
  var magnitude = new Op64();
  if (sign) {
    magnitude.neg(this);
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
  this.f64[0] = val;
  return (this.f64[0].toString() === val);
}

Op64.prototype.toFloat = function() {
  // Javascript outputs "0", not "-0", so do it ourselves
  if (this.f64[0] == 0.0 && this.u32[1] & 0x80000000)
    return "-0";

  return this.f64[0];
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
  if (/[-+]/.test(str[i])) {
    neg = (str[i] == '-');
    i++;
  }

  // Read numbers
  while (str[i] && /[0-1]/.test(str[i])) {
    this.leftshift(this, 1);
    bits += 1;

    this.add(this, {u32: [str.charCodeAt(i) - 48, 0]});
    i++;
  }

  if (neg)
    this.neg(this);

  return bits <= 64;
}

Op64.prototype.toBin = function() {
  return (zeropad(this.u32[1].toString(2), 32)
          + zeropad(this.u32[0].toString(2), 32));
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

// Bitwise left shift
Op64.prototype.leftshift = function(a, bits) {
  if (bits < 0)
    return this.rightshift(a, -bits);

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

// Integer multiply
Op64.prototype.multiply = function(a, b) {
  var product = new Op64();
  for (var i=0; i<32; i++) {
    if (a.u32[0] & (1<<i))
      product.add(product, new Op64().leftshift(b, i));
  }
  for (var i=0; i<32; i++) {
    if (a.u32[1] & (1<<i))
      product.add(product, new Op64().leftshift(b, i+32));
  }
  this.f64[0] = product.f64[0];
  return this;
}

// Integer two's complement negate
Op64.prototype.neg = function(a) {
  var not_a = new Op64().not(a);
  this.add(not_a, {u32: [1, 0]});
  return this;
}

// Bitwise not
Op64.prototype.not = function(a) {
  this.u32[0] = ~a.u32[0];
  this.u32[1] = ~a.u32[1];
  return this;
}
