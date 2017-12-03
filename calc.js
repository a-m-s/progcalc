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

function writevalues8 (row, svalue, isFloat) {
  row.val.i8[0] = svalue;

  row.hexbox.value = row.val.toHex();
  row.octbox.value = row.val.toOct();
  row.sdecbox.value = row.val.toSDec();
  row.udecbox.value = row.val.toUDec();
  row.binbox.value = row.val.toBin();
}

function writevalues16 (row, svalue, isFloat) {
  row.val.i16[0] = svalue;

  row.hexbox.value = row.val.toHex();
  row.octbox.value = row.val.toOct();
  row.sdecbox.value = row.val.toSDec();
  row.udecbox.value = row.val.toUDec();
  row.binbox.value = row.val.toBin();
}

function writevalues32 (row, svalue, isFloat) {
  if (isFloat)
    row.val.f32[0] = svalue;
  else
    row.val.i32[0] = svalue;

  row.hexbox.value = row.val.toHex();
  row.octbox.value = row.val.toOct();
  row.sdecbox.value = row.val.toSDec();
  row.udecbox.value = row.val.toUDec();
  row.floatbox.value = row.val.f32[0].toString();
  row.binbox.value = row.val.toBin();
}

function writevalues64 (row, svalue, isFloat) {
  if (isFloat)
    row.val.f64[0] = svalue;
  else {
    row.val.i32[0] = svalue;
    row.val.i32[1] = (svalue / 0x100000000);
  }

  row.hexbox.value = row.val.toHex();
  row.octbox.value = row.val.toOct();
  row.sdecbox.value = row.val.toSDec();
  row.udecbox.value = row.val.toUDec();
  row.floatbox.value = row.val.f64[0].toString();
  row.binbox.value = row.val.toBin();
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
  row.sizepara.innerHTML = size.toString() + "-bit";
  row.size = size;
  switch (size) {
    case 8:  row.op = optab[1]; row.val = new Op8();  break;
    case 16: row.op = optab[2]; row.val = new Op16(); break;
    case 32: row.op = optab[3]; row.val = new Op32(); break;
    case 64: row.op = optab[4]; row.val = new Op64(); break;
  }

  // Save row object
  rowarray[rowcount] = row;
  rowcount++;
}

addrow (32);
