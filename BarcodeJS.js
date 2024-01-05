//create map for storing barcodes paired with quantities
const barcodes = new Map();

/**
*	addBarcode adds a new barcode to the sheet.
*
*	This function is used to add a new barcode to the sheet by
*	creating a new map key, new list entry and new page entry
*	and adding them to their respective containing divs
*
*	@param	{String}	code	Barcode to be added to the list
*/
function addbarcode(code) {
	//create references to relevant divs to place new elements into
	const barlist = document.getElementById("displaylist");
	const barpage = document.getElementById("page");
	const totalblock = document.getElementById("total-container");
	
	//create the list entry and the page entry
	const row = createListRow(code);
	const bar = createPageEntry(code);
	
	//append entries to the relevant divs
	barlist.appendChild(row);
	barpage.insertBefore(bar, totalblock);
}

/**
*	createListRow creates the html elements for a barcode list entry.
*
*	This function creates the label, quantity input field and a delete
*	button for a provided barcode, wraps it in a containing div and returns
*	a reference to said container to the function call.
*
*	@param	{String}	code	Barcode to create a list entry for.
*
*	@return	{Object}	an object reference for the div containing the list entry.
*/
function createListRow(code) {
	//create containing div
	const row = document.createElement("div");
	row.className = "listrow";
	row.id = "row-"+code;
	
	//create row label
	const lab = document.createElement("label");
	lab.htmlfor = "list-"+code;
	lab.id = "lab-"+code;
	lab.className = "listlabel";
	lab.innerHTML = code+":";
	
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
	
	//create delete button
	const delbutton = document.createElement("button");
	delbutton.type = "button";
	delbutton.id = "del-"+code;
	delbutton.setAttribute("code", code);
	delbutton.className = "delbutton";
	delbutton.innerHTML = "❌"
	delbutton.addEventListener("click", delRow);
	
	//append elements to the containing div
	row.appendChild(lab);
	row.appendChild(qty);
	row.appendChild(delbutton);
	
	//return div reference to the function call
	return row;
}

/**
*	createListRow creates the html elements for a barcode lpage entry.
*
*	This function creates the quantity label and barcode image
*	for a provided barcode, wraps it in a containing div and returns
*	a reference to said container to the function call.
*
*	@param	{String}	code	Barcode to create a list entry for.
*
*	@return	{Object}	an object reference for the div containing the page entry.
*/
function createPageEntry(code) {
	//create containing div
	const cont = document.createElement("div");
	cont.className = "barcode-container";
	cont.id = "cont-"+code;
	
	//create quantity label
	const lab = document.createElement("p");
	lab.className = "qty-label";
	lab.id = "qty-"+code;
	lab.innerHTML = "X"+1;
	
	//create image element to insert barcode into
	const bar = document.createElement("img");
	bar.id = code;
	bar.className = "barcode";
	//insert barcode into image element
	JsBarcode(bar, code,{format: "EAN13", height: 75});
	
	//append label and image into the containing div
	cont.appendChild(lab);
	cont.appendChild(bar);
	
	//return div reference to the function call
	return cont;
	
}

/**
*	inEnter checks which key triggered a keyup event.
*
*	This function is triggered by the keyup event on the barcode input,
*	It checks if the key used was either enter or numpad enter before calling
*	the addEntry function and clearing the input.
*/
function inEnter(event){
	const input = document.getElementById("code-in");
	if (event.code == "Enter" || event.code == "NumpadEnter"){
		addEntry();
		input.value = "";
	}
}

/**
*	addEntry adds a barcode to the sheet or increases a quantity.
*
*	This function reads the text currently in the barcode input and then
*	verifies the barcode validity using verifyCode(). Assuming it is valid It
*	then checks if the barcode is already on the sheet. If it is it simply increases
*	the quantity of that barcode by one. If it is not then it calls addBarcode to
*	add the new entry.
*/
function addEntry(){
	//create a reference to the barcode input
	const code = document.getElementById("code-in").value;
	
	//check the validity of the barcode and alert user if it is invalid
	if (!verifyCode(code)){
		alert("Invalid barcode.");
		return;
	}
	//check if the barcode is already included
	if (barcodes.has(code)){
		//if so, increment barcode quantity by one
		barcodes.set(code, barcodes.get(code)+1);
		//then update relevent labels
		document.getElementById("list-"+code).value = barcodes.get(code);
		document.getElementById("qty-"+code).innerHTML = "X"+barcodes.get(code);
	} else {
		//if not, add the new entry
		barcodes.set(code, 1);
		addbarcode(code);
	}
	//update the grand total
	updateTotal();
	//reset focus to the input
	document.getElementById("code-in").focus();
	document.getElementById("code-in").select()
}

/**
*	verifyCode Checks the validity of a barcode Input
*
*	This function checks if the input follows the correct standards for
*	an EAN-13 barcode. It should contain only numbers, be 13 digits long
*	and should have the correct check digit.
*
*	@param	{String}	code	The barcode to be verified
*
*	@return	{boolean}	A true or false value indicating barcode validity
*/
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

/**
*	delRow removes a specific barcode from the list.
*
*	This function is fired by clicking the delete button corresponding
*	to a specific barcode in the list. It retrieves the code from the source
*	button's code attribute then uses it to delete the map entry and the divs
*	contianing the corresponding list and page entries beforee updating the grand total.
*/
function delRow(event){
	const source = event.srcElement;
	var code = source.getAttribute("code");
	barcodes.delete(code);
	document.getElementById("row-"+code).remove();
	document.getElementById("cont-"+code).remove();
	updateTotal();
}

/**
*	qtyChange repsonds to the user editing a barcode quantity
*
*	This function is fired by changing the value in a barcodes corresponding
*	number input in the list. It checks the quantity validity (number > 0) then
*	either alerts the user of an ivalid input or calls the update qty function
*	to make the actual change.
*/
function qtyChange(event){
	//retrieve the element which is the source of the event
	const source = event.srcElement;
	//extracts the corresponding barcode
	var code = source.getAttribute("code");
	//parses the new value from the number input
	var val = parseInt(source.value);
	//if the value is invalid
	if (source.value == "0" || source.value == "" || val < 1) {
		//alert the user and reset back to previous value
		alert("Invalid Number Input");
		source.value = barcodes.get(code);
	} else {
		//otherwise call updateQty to update relevant variables/labels
		updateQty(code, val);
		//set the text in the input to the parsed value. This effectively rounds down
		//decimal inputs
		source.value = val;
	}
}

/**
*	updateQty manually edits the quantity of a specified barcode.
*	
*	This function takes in a barcode to be changed and it's new quantity amount
*	then updates all relevant variables and labels.
*
*	@param	{String}	code	the barcode to be edited
*	@param	{int}		val		The new barcode quantity
*/
function updateQty(code, val){
	//update map
	barcodes.set(code, val);
	//update total on page
	document.getElementById("qty-"+code).innerHTML = "X"+barcodes.get(code);
	//update grand total
	updateTotal();
}

/**
*	updateTotal updates the total number of barcodes on the page
*
*	This function iterates over the map, summing all barcode quantities
*	then updates the toal label on the barcode sheet.
*/
function updateTotal() {
	//create running total
	var tot = 0;
	//iterate over all values in the map, adding them to the total
	for (const x of barcodes.values()){
		tot += x;
	}
	//update the total label on the sheet
	document.getElementById("totalp").innerHTML = "Total<br>"+tot;
}

/**
*	updateAllTotals ensures page quantites match quantities in the Map
*
*	This function iterates over the map and ensures that the quantity stated
*	in the label on the sheet matches that stored in the map
*/
function updateAllTotals() {
	//iterate over all keys in the map
	for (const x of barcodes.keys()) {
		//set the quantity label equal to "X" plus the value from the map
		document.getElementById("qty-"+x).innerHTML = "X"+barcodes.get(x);
	}
	//update the grand total
	updateTotal();
}

/**
*	completeReset completely clears the sheet
*
*	This function deletes all barcodes from the list, page and map along with
*	all quantities. This allows for the user to start again from scratch.
*/
function completeReset() {
	//create a prompt for the user to confirm that they ACTUALLY want 
	//to clear everything. This prevents 'fat-fingering' the clear button.
	const resp = confirm("WARNING!\n\nThis will remove all barcodes from the \
sheet and start again from scratch with a blank sheet.\n\n\
Are you sure you want to do this?");

	//if they do actually want to clear everything
	if(resp){
		//iterate over all keys in the map, deleting each one
		for (const x of barcodes.keys()) {
			barcodes.delete(x);
		}
		//create a list of all page entries
		const pageentries = document.querySelectorAll(".barcode-container")
		//iterate over the list, removing them all from the page.
		for (const x of pageentries) {
			x.remove();
		}
		//create a list of all list entries
		const listentries = document.querySelectorAll(".listrow")
		//iterate over the list, removing them all from the sheet
		for (const x of listentries) {
			x.remove();
		}
		//update the grand total to reflect the lack of barcodes
		updateTotal();
	}
}
/**
*	Prints the page
*
*	This function performs a final check before calling the print function
*/
function printPage(){
	//check all quantities are correct
	updateAllTotals();
	//call the print dialog
	print()
}