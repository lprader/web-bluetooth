/* https://googlechrome.github.io/samples/web-bluetooth/notifications.html */
/* https://github.com/GoogleChrome/samples/blob/gh-pages/web-bluetooth/notifications.js */

document.querySelector('#connect').addEventListener('click', function(event) {
	event.stopPropagation();
	event.preventDefault();
	clearLog();
	onConnectButtonClick();
});

function onConnectButtonClick() {
	let encoder = new TextEncoder('utf-8');
	let textField = document.getElementById("ssid");
	let ssid = encoder.encode(textField.value);
	textField = document.getElementById("password");
	let password = encoder.encode(textField.value);

	let serviceUuid = 0xFF00;
	let ssidCharacteristicUuid = 0xFF01;
	let passwordCharacteristicUuid = 0xFF02;
	let controlCharacteristicUuid = 0xFF03;

	log('Requesting Bluetooth Device...');
	navigator.bluetooth.requestDevice({ filters: [{services: [serviceUuid]}]})
	.then(device => {
		log('Connecting to GATT Server...');
		return device.gatt.connect();
	})
  	.then(server => {
		return server.getPrimaryServices();
  	})
  	.then(services => {
		log('Writing Characteristics...');
		let queue = Promise.resolve();
		services.forEach(service => {
		  queue = queue.then(_ => service.getCharacteristics().then(characteristics => {
			characteristics.forEach(characteristic => {
				if (characteristic.uuid.indexOf(ssidCharacteristicUuid.toString(16)) > -1) {
					characteristic.writeValue(ssid);
				}
				else if (characteristic.uuid.indexOf(passwordCharacteristicUuid.toString(16)) > -1) {
					characteristic.writeValue(password);
				}
				else if (characteristic.uuid.indexOf(controlCharacteristicUuid.toString(16)) > -1) {
					characteristic.writeValue(Uint8Array.of(1));
				}
			});
		  }));
		});
		return queue;
	})
	.catch(error => {
		log('Argh! ' + error);
	});
}