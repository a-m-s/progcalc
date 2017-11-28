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
	  <td>Float32:</td> \n\
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

function writevalues32 (row, svalue, isFloat) {
  var intvalue = new Int32Array(1);
  var uintvalue = new Uint32Array(intvalue.buffer);
  var floatvalue = new Float32Array(intvalue.buffer);

  if (isFloat)
    floatvalue[0] = svalue;
  else
    intvalue[0] = svalue;

  row.hexbox.value = uintvalue[0].toString(16);
  row.octbox.value = uintvalue[0].toString(8);
  row.sdecbox.value = intvalue[0].toString(10);
  row.udecbox.value = uintvalue[0].toString(10);
  row.floatbox.value = floatvalue[0].toString();
  row.binbox.value = uintvalue[0].toString(2);
}

optab[3] = {
  writevalues: writevalues32
};

function intchanged (box, radix) {
  var op = box.row.size;
  optab[op].writevalues (box.row, parseInt(box.value, radix), false);
}

function floatchanged (box) {
  var op = box.row.size;
  optab[op].writevalues (box.row, box.value, true);
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
  row.size = size;

  // Save row object
  rowarray[rowcount] = row;
  rowcount++;
}

addrow (3);
