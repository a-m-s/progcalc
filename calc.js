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

var template=`
    <td>
      <p class="labelpara"></p>
      <p class="oppara"></p>
      <p class="hideable sizepara"></p>
      <p>
        <button class="hideable deletebutton"
          onClick="deleterow(this)">Delete</button>
      </p>
    </td>
    <td>
      <table class="convtable">
	<tr>
	  <td><input onFocus="boxfocused(this, \'hexbox\')"
		     onInput="valchanged(this, \'Hex\', true)"
		     onChange="valchanged(this, \'Hex\', false)"
		     placeholder="Hexadecimal" title="Hexadecimal"
		     class="hideable hexbox" size=64></input></td>
	</tr>
	<tr>
	  <td><input onFocus="boxfocused(this, \'octbox\')"
		     onInput="valchanged(this, \'Oct\', true)"
		     onChange="valchanged(this, \'Oct\', false)"
                     placeholder="Octal" title="Octal"
		     class="hideable octbox" size=64></input></td>
	</tr>
	<tr>
	  <td><input onFocus="boxfocused(this, \'sdecbox\')"
		     onInput="valchanged(this, \'SDec\', true)"
		     onChange="valchanged(this, \'SDec\', false)"
		     placeholder="Signed Decimal" title="Signed Decimal"
		     class="hideable sdecbox primary" size=64></input></td>
	</tr>
	<tr>
	  <td><input onFocus="boxfocused(this, \'udecbox\')"
		     onInput="valchanged(this, \'UDec\', true)"
		     onChange="valchanged(this, \'UDec\', false)"
		     placeholder="Unsigned Decimal"
		     title="Unsigned Decimal"
		     class="hideable udecbox" size=64></input></td>
	</tr>
	<tr>
	  <td><input onFocus="boxfocused(this, \'floatbox\')"
		     onInput="valchanged(this, \'Float\', true)"
		     onChange="valchanged(this, \'Float\', false)"
		     placeholder="Floating Point Decimal"
		     title="Floating Point Decimal"
		     class="hideable floatbox" size=64></input></td>
	</tr>
	<tr>
	  <td><input onFocus="boxfocused(this, \'binbox\')"
		     onInput="valchanged(this, \'Bin\', true)"
		     onChange="valchanged(this, \'Bin\', false)"
		     placeholder="Binary" title="Binary"
		     class="hideable binbox" size=64></input></td>
	</tr>
      </table>
    </td>
    <td>
      <div class="warning hidden">Err</div>
      <input type="radio" class="leftop" name="leftop"
	onChange="selectop()">
	Left Operand
      </input>
      <br>
      <input type="radio" class="rightop" name="rightop"
        onChange="selectop()">
	Right Operand
      </input>
    </td>
`;
var elements = ["labelpara", "oppara", "sizepara", "deletebutton",
		"hexbox", "octbox", "sdecbox", "udecbox", "floatbox",
                "binbox",
		"warning", "leftop", "rightop"];
var operators = {
  add: {type: "binop", symbol: "&plus;"},
  divide: {type: "binop", symbol: "&divide;"},
  multiply: {type: "binop", symbol: "&times;"},
  negate: {type: "unop", symbol: "&minus;"},
  abs: {type: "unop", symbol: "abs"},
  subtract: {type: "binop", symbol: "&minus;"},
  modulus: {type: "binop", symbol: "mod"},
  udivide: {type: "binop", symbol: "&divide;<sub>u</sub>"},
  umodulus: {type: "binop", symbol: "mod<sub>u</sub>"},
  sext16: {type: "unop", symbol: "sext", output: new Op16()},
  sext32: {type: "unop", symbol: "sext", output: new Op32()},
  sext64: {type: "unop", symbol: "sext", output: new Op64()},
  zext16: {type: "unop", symbol: "zext", output: new Op16()},
  zext32: {type: "unop", symbol: "zext", output: new Op32()},
  zext64: {type: "unop", symbol: "zext", output: new Op64()},

  addfp: {type: "binop", symbol: "&plus;", fp1: true, fp2: true},
  ceilfp: {type: "unop", symbol: "ceil ", fp1: true},
  dividefp: {type: "binop", symbol: "&divide;", fp1: true, fp2: true},
  floorfp: {type: "unop", symbol: "floor ", fp1: true},
  multiplyfp: {type: "binop", symbol: "&times;", fp1: true, fp2: true},
  negatefp: {type: "unop", symbol: "&minus;", fp1: true},
  absfp: {type: "unop", symbol: "abs", fp1: true},
  subtractfp: {type: "binop", symbol: "&minus;", fp1: true, fp2: true},
  roundfp: {type: "unop", symbol: "round ", fp1: true},

  and: {type: "binop", symbol: "&and;"},
  not: {type: "unop", symbol: "&not;"},
  or: {type: "binop", symbol: "&or;"},
  xor: {type: "binop", symbol: "xor"},
  leftshift: {type: "binop", symbol: "<<"},
  rightshift: {type: "binop", symbol: ">>>"},
  arightshift: {type: "binop", symbol: ">>"},
  trunc8: {type: "unop", symbol: "trunc", output: new Op8()},
  trunc16: {type: "unop", symbol: "trunc", output: new Op16()},
  trunc32: {type: "unop", symbol: "trunc", output: new Op32()},
};

var calculatorui = document.getElementById("calculator");
var rowcount = 0;
var rowarray = [];
var left = null;
var right = null;

function boxfocused (box, name) {
  var row = box.row;

  // Make this box the primary field
  row[row.primary].classList.remove("primary");
  row.primary = name;
  box.classList.add("primary");
}

function valchanged (box, radix, focused) {
  var row = box.row;

  // Convert the string, and report error state to CSS
  var ok = row.val["from"+radix] && row.val["from"+radix](box.value);
  box.classList.toggle ("error", focused && !ok);

  updateboxes(row, focused ? box : null);
}

function updateboxes (row, exceptbox) {
  if (row.deleted == false) {
    // Update all boxes except the focused one
    if (row.hexbox !== exceptbox)
      row.hexbox.value = row.val.toHex();
    if (row.octbox !== exceptbox)
      row.octbox.value = row.val.toOct();
    if (row.sdecbox !== exceptbox)
      row.sdecbox.value = row.val.toSDec();
    if (row.udecbox !== exceptbox)
      row.udecbox.value = row.val.toUDec();
    if ((row.floatbox !== exceptbox) && row.val.toFloat)
      row.floatbox.value = row.val.toFloat();
    if (row.binbox !== exceptbox)
      row.binbox.value = row.val.toBin();
    if (row.val.warning) {
      row.warning.classList.remove("hidden");
      row.warning.innerHTML = row.val.warning;
    } else {
      row.warning.classList.add("hidden");
    }
  }

  for (var dep of row.dependencies)
    updateval(dep);
}

function updateval(row) {
  row.val.warning = null;
  row.val[row.op](row.left.val, row.right ? row.right.val : null);
  updateboxes (row, null);
}

function selectop() {
  var elm = document.querySelector('input[name="leftop"]:checked');
  if (elm)
    left = elm.row;
  elm = document.querySelector('input[name="rightop"]:checked');
  if (elm)
    right = elm.row;

  // Enable or disable the operator buttons.
  for (var op in operators) {
    switch (operators[op].type) {
      case "unop":
        document.getElementById(op).disabled =
	  (!left
	   || (operators[op].output
	       ? !operators[op].output.valid_conversion(op, left.size)
	       : !left.val[op]));
	break;
      case "binop":
        document.getElementById(op).disabled =
	  (!left || !right || left.size != right.size
	   || !left.val[op]);
	break;
    }
  }
  document.getElementById("intfn").disabled = !left;
  document.getElementById("fpfn").disabled = !left;
  document.getElementById("binfn").disabled = !left;
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
  tr.classList.add("calcrow");
  tr.classList.add("expandable");
  tr.innerHTML = template;

  // Record element objects.
  var row = {
    "index": rowcount,
    "name": rowname(rowcount),
    "tr": tr,
    "dependencies": [],
    "deleted": false,
    "primary": "sdecbox"
  };
  for (var cls of elements) {
    var elm = tr.querySelector("." + cls);
    elm.row = row;
    row[cls] = elm;
  }

  // Initialize new row data
  row.labelpara.innerHTML = row.name;
  row.sizepara.innerHTML = size.toString() + "-bit";
  row.size = size;
  switch (size) {
    case 8:  row.val = new Op8();  break;
    case 16: row.val = new Op16(); break;
    case 32: row.val = new Op32(); break;
    case 64: row.val = new Op64(); break;
  }
  row.val.row = row;

  if (!row.val.fromFloat)
    row.floatbox.disabled = true;

  row.binbox.scrollIntoView();

  // Save row object
  rowarray[rowcount] = row;
  rowcount++;

  return row;
}

function addrow_op(op) {
  var row = addrow (operators[op].output
		    ? operators[op].output.size : left.size);
  row.left = left;
  row.right = right;
  row.op = op;
  left.dependencies.push(row);
  if (left !== right && right)
    right.dependencies.push(row);
  boxfocused(row[left.primary], left.primary);

  var fp1 = (operators[op].fp1) ? "<sub>fp</sub>" : "";
  var fp2 = (operators[op].fp2) ? "<sub>fp</sub>" : "";

  switch (operators[op].type) {
    case "unop":
      row.oppara.innerHTML =
	`= <span class='operator'>${operators[op].symbol}</span>`
	+ `<span class='operand'>${left.name}${fp1}</span>`;
      break;
    case "binop":
      row.oppara.innerHTML =
	`= <span class='operand'>${left.name}${fp1}</span>`
	+ ` <span class='operator'>${operators[op].symbol}</span> `
	+ `<span class='operand'>${right.name}${fp2}</span>`;
      break;
  }

  for (var elm of elements) {
    if (row[elm].tagName == "INPUT"
        && row[elm].type == "text")
      row[elm].readOnly = true;
  }

  updateval(row);
}

function deleterow(button) {
  button.row.tr.innerHTML = "";
  button.row.deleted = true;
}

addrow (32);
selectop ();
