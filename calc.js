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
	  <td><input onInput="valchanged(this, \'Hex\', true)" \n\
		     onChange="valchanged(this, \'Hex\', false)" \n\
		     placeholder="Hexadecimal" title="Hexadecimal" \n\
		     class="hexbox" size=64></input></td> \n\
	</tr> \n\
	<tr> \n\
	  <td><input onInput="valchanged(this, \'Oct\', true)" \n\
		     onChange="valchanged(this, \'Oct\', false)" \n\
                     placeholder="Octal" title="Octal" \n\
		     class="octbox" size=64></input></td> \n\
	</tr> \n\
	<tr> \n\
	  <td><input onInput="valchanged(this, \'SDec\', true)" \n\
		     onChange="valchanged(this, \'SDec\', false)" \n\
		     placeholder="Signed Decimal" title="Signed Decimal" \n\
		     class="sdecbox" size=64></input></td> \n\
	</tr> \n\
	<tr> \n\
	  <td><input onInput="valchanged(this, \'UDec\', true)" \n\
		     onChange="valchanged(this, \'UDec\', false)" \n\
		     placeholder="Unsigned Decimal" \n\
		     title="Unsigned Decimal" \n\
		     class="udecbox" size=64></input></td> \n\
	</tr> \n\
	<tr> \n\
	  <td><input onInput="valchanged(this, \'Float\', true)" \n\
		     onChange="valchanged(this, \'Float\', false)" \n\
		     placeholder="Floating Point Decimal" \n\
		     title="Floating Point Decimal" \n\
		     class="floatbox" size=64></input></td> \n\
	</tr> \n\
	<tr> \n\
	  <td><input onInput="valchanged(this, \'Bin\', true)" \n\
		     onChange="valchanged(this, \'Bin\', false)" \n\
		     placeholder="Binary" title="Binary" \n\
		     class="binbox" size=64></input></td> \n\
	</tr> \n\
      </table> \n\
    </td> \n\
    <td> \n\
      <input type="radio" class="leftop">Left Operand</input> \n\
      <br> \n\
      <input type="radio" class="rightop">Right Operand</input> \n\
    </td> \n\
';
var elements = ["labelpara", "sizepara", "hexbox", "octbox", "sdecbox",
		"udecbox", "floatbox", "binbox"];

var update = 0;
var calculatorui = document.getElementById("calculator");
var rowcount = 0;
var rowarray = [];

function valchanged (box, radix, focused) {
  var row = box.row;

  // Convert the string, and report error state to CSS
  var ok = row.val["from"+radix] && row.val["from"+radix](box.value);
  box.classList.toggle ("error", focused && !ok);

  // Update all boxes except the focused one
  if (!focused || row.hexbox !== box)
    row.hexbox.value = row.val.toHex();
  if (!focused || row.octbox !== box)
    row.octbox.value = row.val.toOct();
  if (!focused || row.sdecbox !== box)
    row.sdecbox.value = row.val.toSDec();
  if (!focused || row.udecbox !== box)
    row.udecbox.value = row.val.toUDec();
  if ((!focused || row.floatbox !== box) && row.val.toFloat)
    row.floatbox.value = row.val.toFloat();
  if (!focused || row.binbox !== box)
    row.binbox.value = row.val.toBin();
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
    case 8:  row.val = new Op8();  break;
    case 16: row.val = new Op16(); break;
    case 32: row.val = new Op32(); break;
    case 64: row.val = new Op64(); break;
  }

  if (!row.val.fromFloat)
    row.floatbox.disabled = true;

  row.binbox.scrollIntoView();

  // Save row object
  rowarray[rowcount] = row;
  rowcount++;
}

addrow (32);
