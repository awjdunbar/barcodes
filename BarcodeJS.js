const barcodes = new Map();

function addbarcode(code) {
	const barlist = document.getElementById("displaylist");
	const barpage = document.getElementById("page");
	const totalblock = document.getElementById("total-container");
	const row = createListRow(code);
	const bar = createPageEntry(code);
	barlist.appendChild(row);
	barpage.insertBefore(bar, totalblock);
}
function createListRow(code) {
	//create containing div
	const row = document.createElement("div");
	row.className = "listrow";
	row.id = "row-"+code;
	row.setAttribute("code", code);
	
	//create row label
	const lab = document.createElement("label");
	lab.htmlfor = "list-"+code;
	lab.id = "lab-"+code;
	lab.className = "listlabel";
	lab.innerHTML = code+":";
	row.appendChild(lab);
	
	//create quantity input
	const qty = document.createElement("input");
	qty.type = "number";
	qty.min = "1";
	qty.id = "list-"+code;
	qty.name = "list-"+code;
	qty.className = "listnum";
	qty.setAttribute("code", code);
	qty.value = "1";
	qty.onchange = qtyChange;
	row.appendChild(qty);
	
	//create delete button
	const delbutton = document.createElement("button");
	delbutton.type = "button";
	delbutton.id = "del-"+code;
	delbutton.setAttribute("code", code);
	delbutton.className = "delbutton";
	delbutton.innerHTML = "❌"
	delbutton.addEventListener("click", delRow);
	row.appendChild(delbutton);
	
	return row;
}
function createPageEntry(code) {
	const cont = document.createElement("div");
	cont.className = "barcode-container";
	cont.id = "cont-"+code;
	
	const lab = document.createElement("h1");
	lab.className = "qty-label";
	lab.id = "qty-"+code;
	lab.innerHTML = "X"+1;
	
	const bar = document.createElement("img");
	bar.id = code;
	bar.className = "barcode";
	JsBarcode(bar, code,{format: "EAN13"});
	
	cont.appendChild(lab);
	cont.appendChild(bar);
	return cont;
	
}
function inEnter(event){
	const input = document.getElementById("code-in");
	if (event.code == "Enter" || event.code == "NumpadEnter"){
		addEntry();
		input.value = "";
	}
}
function addEntry(){
	code = document.getElementById("code-in").value;
	if (!verifyCode(code)){
		alert("Invalid barcode.");
		return;
	}
	if (barcodes.has(code)){
		barcodes.set(code, barcodes.get(code)+1);
		document.getElementById("list-"+code).value = barcodes.get(code);
		document.getElementById("qty-"+code).innerHTML = "X"+barcodes.get(code);
	} else {
		barcodes.set(code, 1);
		addbarcode(code);
	}
	updateTotal();
	document.getElementById("code-in").focus();
	document.getElementById("code-in").select()
}

function verifyCode(code){
	//use regex to check if barcode is only numbers
	let regcheck = /^\d+$/
	if (!regcheck.test(code)) {return false;}
	//check for correct length
	if (code.length != 13) {return false;}
	//separate the code from the ckech digit
	var barcode = code.substring(0, code.length - 1);
	var checkdigit = parseInt(code.slice(-1));
	//create variable to store the digit sum
	var digitsum = 0;
	//separate out individual code digits
	var vals = barcode.split("");
	//for each digit
	vals.map(function (digit, index){
		//convert to int
		digit = parseInt(digit);
		//if in an even position (odd index)
		//multiply this digit by 3
		if (index%2 == 1){digit = 3*digit;}
		//add the digit to the sum
		digitsum += digit;})
	//take the remainder when dividing by 10
	digitsum = digitsum%10;
	//if it is zero, leave it as is, if not, subtract from 10
	if (digitsum != 0) {digitsum = 10-digitsum;}
	//compare to check digit, return accordingly
	if (digitsum != checkdigit) {return false;}
	else {return true;}
}

function delRow(event){
	const source = event.srcElement;
	var code = source.getAttribute("code");
	barcodes.delete(code);
	document.getElementById("row-"+code).remove();
	document.getElementById("cont-"+code).remove();
	updateTotal();
}
function qtyChange(event){
	const source = event.srcElement;
	var code = source.getAttribute("code");
	var val = parseInt(source.value);
	if (source.value == "0" || source.value == "" || val < 1) {
		alert("Invalid Number Input");
		source.value = barcodes.get(code);
	} else {
		updateQty(code, val);
		source.value = val;
	}
}

function updateQty(code, val){
	barcodes.set(code, val);
	document.getElementById("qty-"+code).innerHTML = "X"+barcodes.get(code);
	updateTotal();
	//change page quantity
}
function updateTotal() {
	var tot = 0;
	for (const x of barcodes.values()){
		tot += x;
	}
	document.getElementById("total").innerHTML = tot;
}
function updateAllTotals() {
	for (const x of barcodes.keys()) {
		document.getElementById("qty-"+x).innerHTML = "X"+barcodes.get(x);
	}
	updateTotal();
}
function completeReset() {
	const resp = confirm("WARNING!\n\nThis will remove all barcodes from the \
sheet and start again from scratch with a blank sheet.\n\n\
Are you sure you want to do this?");
	if(resp){
	for (const x of barcodes.keys()) {
		barcodes.delete(x);
	}
	const pageentries = document.querySelectorAll(".barcode-container")
	for (const x of pageentries) {
		x.remove();
	}
	const listentries = document.querySelectorAll(".listrow")
	for (const x of listentries) {
		x.remove();
	}
	updateTotal();
	}
}
function printPage(){
	updateAllTotals();
	print()
}