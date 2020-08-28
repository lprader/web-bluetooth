if (navigator.userAgent.indexOf("Chrome") == -1) {
	document.getElementById("error").style.display = "block";
	document.getElementById("error").innerHTML =  "WARNING: Web Bluetooth is only available in Chrome.<BR>Please open this webpage in Chrome.";
}
else if (!navigator.bluetooth) {
	document.getElementById("error").style.display = "block";
	document.getElementById("error").innerHTML =  'WARNING: The Web Bluetooth API is not available.<BR>Please make sure the "Experimental Web Platform features" flag is enabled.';
}