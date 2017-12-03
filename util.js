function zeropad(s, width) {
  var out = "";
  for (var l = width - s.length; l > 0; l--)
    out += "0";
  return out + s;
}
