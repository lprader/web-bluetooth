/* https://googlechrome.github.io/samples/web-bluetooth/notifications.html */
/* https://github.com/GoogleChrome/samples/blob/gh-pages/web-bluetooth/notifications.js */

var encoder = new TextEncoder('utf-8');
var decoder = new TextDecoder('utf-8');

document.querySelector('#connect').addEventListener('click', function(event) {
	event.stopPropagation();
	event.preventDefault();
	clearLog();
	onConnectButtonClick();
});

document.querySelector('#ssid').addEventListener('input', function(event) {
	let value = event.target.value;
	let length = value.length;
	document.querySelector('#connect').disabled = (0 === length);
});

function onConnectButtonClick() {
	let ssid = encoder.encode(document.getElementById("ssid").value);
	let password = encoder.encode(document.getElementById("password").value);

	let serviceUuid = 0xFF00;
	let ssidCharacteristicUuid = 0xFF01;
	let passwordCharacteristicUuid = 0xFF02;
	let controlCharacteristicUuid = 0xFF03;
	let statusCharacteristicUuid = 0xFF04;
	
	let ssidCharacteristic, passwordCharacteristic, controlCharacteristic, statusCharacteristic;

	log('Requesting Bluetooth Device...');
	navigator.bluetooth.requestDevice({ filters: [{services: [serviceUuid]}]})
	.then(device => {
		log('Connecting to GATT Server...');
		return device.gatt.connect();
	})
  	.then(server => {
		log('Getting Service...');
		return server.getPrimaryService(serviceUuid);
  	})
  	.then(service => {
		log('Getting Characteristics...');
		return service.getCharacteristics();
  	})
	.then(characteristics => {
		characteristics.forEach(characteristic => {
			if (characteristic.uuid.indexOf(ssidCharacteristicUuid.toString(16)) > -1) {
				ssidCharacteristic = characteristic;
			}
			else if (characteristic.uuid.indexOf(passwordCharacteristicUuid.toString(16)) > -1) {
				passwordCharacteristic = characteristic;
			}
			else if (characteristic.uuid.indexOf(controlCharacteristicUuid.toString(16)) > -1) {
				controlCharacteristic = characteristic;
			}
			else if (characteristic.uuid.indexOf(statusCharacteristicUuid.toString(16)) > -1) {
				statusCharacteristic = characteristic;
			}
		});
		log('Enabling Status Notifications...');
		statusCharacteristic.addEventListener('characteristicvaluechanged', handleNotifications);
		return statusCharacteristic.startNotifications();
	})
	.then(_ => {
		ssidCharacteristic.writeValue(ssid);
		if (password.length)
			passwordCharacteristic.writeValue(password);
		controlCharacteristic.writeValue(Uint8Array.of(1));
	})
	.catch(error => {
		log('Argh! ' + error);
	});
}

function handleNotifications(event) {
	log(`> ${decoder.decode(event.target.value)}`);
}