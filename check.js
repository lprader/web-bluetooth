if (navigator.userAgent.indexOf("Chrome") == -1) {
	document.getElementById("error").innerHTML =  "WARNING: This webpage is only compatible with Chrome";
}
else if (!navigator.bluetooth) {
	document.getElementById("error").innerHTML =  'WARNING: Web Bluetooth API is not available.\nPlease make sure the "Experimental Web Platform features" flag is enabled.';
}