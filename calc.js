var template='\
  <tr id="newrow" class="calcrow"> \n\
    <td> \n\
      <p class="label"></p> \n\
      <p class="sizepara"> \n\
        Size: \n\
        <select class="size"> \n\
          <option value="8 bit">8 bit</option> \n\
	  <option value="16 bit">16 bit</option> \n\
	  <option value="32 bit">32 bit</option> \n\
	  <option value="64 bit">64 bit</option> \n\
	</select> \n\
      </p> \n\
      <p class="oppara"></p> \n\
      <p> \n\
        <button class="deletebutton">Delete</button> \n\
      </p> \n\
    </td> \n\
    <td> \n\
      <table class="convtable"> \n\
	<tr> \n\
	  <td>Hexadecimal:</td> \n\
	  <td><input onInput="hexchanged(this)" placeholder="0" class="hexbox"></input></td> \n\
	</tr> \n\
	<tr> \n\
	  <td>Octal:</td> \n\
	  <td><input onInput="octchanged(this)" placeholder="0" class="octbox"></input></td> \n\
	</tr> \n\
	<tr> \n\
	  <td>Signed Decimal:</td> \n\
	  <td><input onInput="decchanged(this)" placeholder="0" class="sdecbox"></input></td> \n\
	</tr> \n\
	<tr> \n\
	  <td>Unsigned Decimal:</td> \n\
	  <td><input onInput="decchanged(this)" placeholder="0" class="udecbox"></input></td> \n\
	</tr> \n\
	<tr> \n\
	  <td>Float32:</td> \n\
	  <td><input onInput="floatchanged(this)" placeholder="0" class="floatbox"></input></td> \n\
	</tr> \n\
	<tr> \n\
	  <td>Binary:</td> \n\
	  <td><input onInput="binchanged(this)" placeholder="0" class="binbox"></input></td> \n\
	</tr> \n\
      </table> \n\
    </td> \n\
    <td> \n\
      <input type="radio" class="leftop">Left Operand</input> \n\
      <input type="radio" class="rightop">Right Operand</input> \n\
    </td> \n\
  </tr> \n\
';

var update = 0;
var calculatorui = document.getElementById("calculator");
var rowcount = 0;
var rowarray = [];

function findrow (elm) {
  while ((elm = elm.parentElement) && !elm.classList.contains("calcrow"));
  return elm;
}

function writevalues (row, hexvalue, isFloat) {
  var intvalue = new Int32Array(1);
  var uintvalue = new Uint32Array(intvalue.buffer);
  var floatvalue = new Float32Array(intvalue.buffer);

  if (isFloat)
    floatvalue[0] = hexvalue;
  else
    intvalue[0] = hexvalue;

  row.querySelector(".hexbox").value = uintvalue[0].toString(16);
  row.querySelector(".octbox").value = uintvalue[0].toString(8);
  row.querySelector(".sdecbox").value = intvalue[0].toString(10);
  row.querySelector(".udecbox").value = uintvalue[0].toString(10);
  row.querySelector(".floatbox").value = floatvalue[0].toString();
  row.querySelector(".binbox").value = uintvalue[0].toString(2);
}

function hexchanged (box) {
  var row = findrow (box);
  writevalues (row, parseInt(box.value, 16), false);
}

function octchanged (box) {
  var row = findrow (box);
  writevalues (row, parseInt(box.value, 8), false);
}

function decchanged (box) {
  var row = findrow (box);
  writevalues (row, parseInt(box.value, 10), false);
}

function floatchanged (box) {
  var row = findrow (box);
  writevalues (row, box.value, true);
}

function binchanged (box) {
  var row = findrow (box);
  writevalues (row, parseInt(box.value, 2), false);
}

function addrow () {
  calculatorui.innerHTML += template;
  var newelm = document.getElementById("newrow");
  newelm.id = "row" + rowcount;
  rowarray[rowcount] = newelm;
  rowcount++;

  var hex = newelm.querySelector(".hexbox");
}

addrow ();
