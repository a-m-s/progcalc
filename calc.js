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
      <p class="sizepara"></p>
      <p>
        <button class="deletebutton"
          onClick="deleterow(this)">Delete</button>
      </p>
    </td>
    <td>
      <table class="convtable">
	<tr>
	  <td><input onInput="valchanged(this, \'Hex\', true)"
		     onChange="valchanged(this, \'Hex\', false)"
		     placeholder="Hexadecimal" title="Hexadecimal"
		     class="hexbox" size=64></input></td>
	</tr>
	<tr>
	  <td><input onInput="valchanged(this, \'Oct\', true)"
		     onChange="valchanged(this, \'Oct\', false)"
                     placeholder="Octal" title="Octal"
		     class="octbox" size=64></input></td>
	</tr>
	<tr>
	  <td><input onInput="valchanged(this, \'SDec\', true)"
		     onChange="valchanged(this, \'SDec\', false)"
		     placeholder="Signed Decimal" title="Signed Decimal"
		     class="sdecbox" size=64></input></td>
	</tr>
	<tr>
	  <td><input onInput="valchanged(this, \'UDec\', true)"
		     onChange="valchanged(this, \'UDec\', false)"
		     placeholder="Unsigned Decimal"
		     title="Unsigned Decimal"
		     class="udecbox" size=64></input></td>
	</tr>
	<tr>
	  <td><input onInput="valchanged(this, \'Float\', true)"
		     onChange="valchanged(this, \'Float\', false)"
		     placeholder="Floating Point Decimal"
		     title="Floating Point Decimal"
		     class="floatbox" size=64></input></td>
	</tr>
	<tr>
	  <td><input onInput="valchanged(this, \'Bin\', true)"
		     onChange="valchanged(this, \'Bin\', false)"
		     placeholder="Binary" title="Binary"
		     class="binbox" size=64></input></td>
	</tr>
      </table>
    </td>
    <td>
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
		"leftop", "rightop"];
var operators = {
  add: {type: "binop", symbol: "&plus;"},
  divide: {type: "binop", symbol: "&divide;"},
  multiply: {type: "binop", symbol: "&times;"},
  negate: {type: "unop", symbol: "&minus;"},
  subtract: {type: "binop", symbol: "&minus;"},

  addfp: {type: "binop", symbol: "&plus;", fp1: true, fp2: true},
  ceilfp: {type: "unop", symbol: "ceil ", fp1: true},
  dividefp: {type: "binop", symbol: "&divide;", fp1: true, fp2: true},
  floorfp: {type: "unop", symbol: "floor ", fp1: true},
  multiplyfp: {type: "binop", symbol: "&times;", fp1: true, fp2: true},
  negatefp: {type: "unop", symbol: "&minus;", fp1: true},
  subtractfp: {type: "binop", symbol: "&minus;", fp1: true, fp2: true},
  roundfp: {type: "unop", symbol: "round ", fp1: true},

  and: {type: "binop", symbol: "&and;"},
  not: {type: "unop", symbol: "&not;"},
};

var calculatorui = document.getElementById("calculator");
var rowcount = 0;
var rowarray = [];
var left = null;
var right = null;

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
  }

  for (var dep of row.dependencies)
    updateval(dep);
}

function updateval(row) {
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
	  (!left || !left.val[op]);
	break;
      case "binop":
        document.getElementById(op).disabled =
	  (!left || !right || left.size != right.size
	   || !left.val[op]);
	break;
    }
  }
  document.getElementById("fpfn").disabled = !left;
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
    "dependencies": [],
    "deleted": false
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
  var row = addrow (left.size);
  row.left = left;
  row.right = right;
  row.op = op;
  left.dependencies.push(row);
  if (left !== right && right)
    right.dependencies.push(row);

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
