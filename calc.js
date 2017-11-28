var template='\
    <td> \n\
      <p class="labelpara"></p> \n\
      <p class="oppara"></p> \n\
      <p class="sizepara"></p> \n\
      <p> \n\
        <button class="deletebutton">Delete</button> \n\
      </p> \n\
    </td> \n\
    <td> \n\
      <table class="convtable"> \n\
	<tr> \n\
	  <td>Hexadecimal:</td> \n\
	  <td><input onInput="intchanged(this, 16)" placeholder="0" class="hexbox"></input></td> \n\
	</tr> \n\
	<tr> \n\
	  <td>Octal:</td> \n\
	  <td><input onInput="intchanged(this, 8)" placeholder="0" class="octbox"></input></td> \n\
	</tr> \n\
	<tr> \n\
	  <td>Signed Decimal:</td> \n\
	  <td><input onInput="intchanged(this, 10)" placeholder="0" class="sdecbox"></input></td> \n\
	</tr> \n\
	<tr> \n\
	  <td>Unsigned Decimal:</td> \n\
	  <td><input onInput="intchanged(this, 10)" placeholder="0" class="udecbox"></input></td> \n\
	</tr> \n\
	<tr> \n\
	  <td>Float:</td> \n\
	  <td><input onInput="floatchanged(this)" placeholder="0" class="floatbox"></input></td> \n\
	</tr> \n\
	<tr> \n\
	  <td>Binary:</td> \n\
	  <td><input onInput="intchanged(this, 2)" placeholder="0" class="binbox"></input></td> \n\
	</tr> \n\
      </table> \n\
    </td> \n\
    <td> \n\
      <input type="radio" class="leftop">Left Operand</input> \n\
      <input type="radio" class="rightop">Right Operand</input> \n\
    </td> \n\
';
var elements = ["labelpara", "sizepara", "hexbox", "octbox", "sdecbox",
		"udecbox", "floatbox", "binbox"];

var update = 0;
var calculatorui = document.getElementById("calculator");
var rowcount = 0;
var rowarray = [];
var optab = [];

function zeropad(s, width) {
  var out = "";
  for (var l = width - s.length; l > 0; l--)
    out += "0";
  return out + s;
}

function writevalues8 (row, svalue, isFloat) {
  var intvalue = new Int8Array(1);
  var uintvalue = new Uint8Array(intvalue.buffer);

  intvalue[0] = svalue;

  row.hexbox.value = zeropad(uintvalue[0].toString(16), 2);
  row.octbox.value = zeropad(uintvalue[0].toString(8), 3);
  row.sdecbox.value = intvalue[0].toString(10);
  row.udecbox.value = uintvalue[0].toString(10);
  row.binbox.value = zeropad(uintvalue[0].toString(2), 8);
}

function writevalues16 (row, svalue, isFloat) {
  var intvalue = new Int16Array(1);
  var uintvalue = new Uint16Array(intvalue.buffer);

  intvalue[0] = svalue;

  row.hexbox.value = zeropad(uintvalue[0].toString(16), 4);
  row.octbox.value = zeropad(uintvalue[0].toString(8), 6);
  row.sdecbox.value = intvalue[0].toString(10);
  row.udecbox.value = uintvalue[0].toString(10);
  row.binbox.value = zeropad(uintvalue[0].toString(2), 16);
}

function writevalues32 (row, svalue, isFloat) {
  var intvalue = new Int32Array(1);
  var uintvalue = new Uint32Array(intvalue.buffer);
  var floatvalue = new Float32Array(intvalue.buffer);

  if (isFloat)
    floatvalue[0] = svalue;
  else
    intvalue[0] = svalue;

  row.hexbox.value = zeropad(uintvalue[0].toString(16), 8);
  row.octbox.value = zeropad(uintvalue[0].toString(8), 11);
  row.sdecbox.value = intvalue[0].toString(10);
  row.udecbox.value = uintvalue[0].toString(10);
  row.floatbox.value = floatvalue[0].toString();
  row.binbox.value = zeropad(uintvalue[0].toString(2), 32);
}

function writevalues64 (row, svalue, isFloat) {
  var floatvalue = new Float64Array(1);
  var intvalue = new Int32Array(floatvalue.buffer);
  var uintvalue = new Uint32Array(floatvalue.buffer);

  if (isFloat)
    floatvalue[0] = svalue;
  else {
    intvalue[0] = svalue;
    intvalue[1] = (svalue / 0x100000000);
  }

  row.hexbox.value = (zeropad(uintvalue[1].toString(16), 8)
		      + zeropad(uintvalue[0].toString(16), 8));
  row.octbox.value = (zeropad(uintvalue[1].toString(8), 11)
                      + zeropad(uintvalue[0].toString(8), 11));
  row.sdecbox.value = intvalue[0].toString(10);
  row.udecbox.value = uintvalue[0].toString(10);
  row.floatbox.value = floatvalue[0].toString();
  row.binbox.value = (zeropad(uintvalue[1].toString(2), 32)
                      + zeropad(uintvalue[0].toString(2), 32));
}

optab[1] = {
  size: 8,
  writevalues: writevalues8
};
optab[2] = {
  size: 16,
  writevalues: writevalues16
};
optab[3] = {
  size: 32,
  writevalues: writevalues32
};
optab[4] = {
  size: 64,
  writevalues: writevalues64
};

function intchanged (box, radix) {
  box.row.op.writevalues (box.row, parseInt(box.value, radix), false);
}

function floatchanged (box) {
  box.row.op.writevalues (box.row, box.value, true);
}

function rowname (index) {
  var name = "";
  do {
    var mod = index % 26;
    name = String.fromCharCode(mod+65) + name;
    index = Math.floor (index / 26) - 1;
  } while (index >= 0);
  return name;
}

function addrow (size) {
  // Insert new row elements
  var tr = calculatorui.insertRow(-1);
  tr.class = "calcrow";
  tr.innerHTML = template;

  // Record element objects.
  var row = {
    "index": rowcount,
    "name": rowname(rowcount),
    "tr": tr,
  };
  for (var cls in elements) {
    var elm = tr.querySelector("." + elements[cls]);
    elm.row = row;
    row[elements[cls]] = elm;
  }

  // Initialize new row data
  row.labelpara.innerHTML = row.name;
  row.sizepara.innerHTML = Math.pow(2, size+2).toString() + "-bit";
  row.op = optab[size];
  row.size = size;

  // Save row object
  rowarray[rowcount] = row;
  rowcount++;
}

addrow (3);
