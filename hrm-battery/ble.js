/* https://googlechrome.github.io/samples/web-bluetooth/notifications.html */
/* https://github.com/GoogleChrome/samples/blob/gh-pages/web-bluetooth/notifications.js */
/* https://googlechrome.github.io/samples/web-bluetooth/discover-services-and-characteristics.html?optionalServices=0x180F */

document.querySelector('#connect').addEventListener('click', function(event) {
	event.stopPropagation();
	event.preventDefault();
	onConnectButtonClick();
});

document.querySelector('#startNotifications').addEventListener('click', function(event) {
	event.stopPropagation();
	event.preventDefault();
	onStartButtonClick();
});

document.querySelector('#stopNotifications').addEventListener('click', function(event) {
	event.stopPropagation();
	event.preventDefault();
	onStopButtonClick();
});

document.querySelector('#readBatteryLevel').addEventListener('click', function(event) {
	event.stopPropagation();
	event.preventDefault();
	onBatteryButtonClick();
});

const hrmServiceUuid = 0x180D;
const hrmCharacteristicUuid = 0x2A37;
const batteryServiceUuid = 0x180F;
const batteryCharacteristicUuid = 0x2A19;
let hrmCharacteristic, batteryCharacteristic;

function getSupportedProperties(characteristic) {
	let supportedProperties = [];
	for (const p in characteristic.properties) {
		if (characteristic.properties[p] === true) {
			supportedProperties.push(p.toUpperCase());
		}
	}
	return '[' + supportedProperties.join(', ') + ']';
}

function onConnectButtonClick() {
	log('Requesting Bluetooth Device...');
	navigator.bluetooth.requestDevice({filters: [{services: [hrmServiceUuid, batteryServiceUuid]}]})
	.then(device => {
		log('Connecting to GATT Server...');
		return device.gatt.connect();
	})
  	.then(server => {
  		log('Connected.')
		// log('Getting Services...');
		return server.getPrimaryServices();
  	})
  	.then(services => {
		// log('Getting Characteristics...');
		let queue = Promise.resolve();
		services.forEach(service => {
		  queue = queue.then(_ => service.getCharacteristics().then(characteristics => {
			// log('> Service: ' + service.uuid);
			characteristics.forEach(characteristic => {
				// log('>> Characteristic: ' + characteristic.uuid + ' ' + getSupportedProperties(characteristic));
				if (characteristic.uuid.indexOf(hrmCharacteristicUuid.toString(16)) > -1) {
					hrmCharacteristic = characteristic;
				}
				else if (characteristic.uuid.indexOf(batteryCharacteristicUuid.toString(16)) > -1) {
					batteryCharacteristic = characteristic;
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

function onStartButtonClick() {
	if (undefined === hrmCharacteristic) return;

	hrmCharacteristic.startNotifications()
	.then(_ => {
		log('> Notifications started');
		hrmCharacteristic.addEventListener('characteristicvaluechanged', handleNotifications);
	})
	.catch(error => {
		log('Argh! ' + error);
	});
}

function onStopButtonClick() {
	if (undefined === hrmCharacteristic) return;

	hrmCharacteristic.stopNotifications()
	.then(_ => {
		log('> Notifications stopped');
		hrmCharacteristic.removeEventListener('characteristicvaluechanged', handleNotifications);
	})
	.catch(error => {
		log('Argh! ' + error);
	});
}

function onBatteryButtonClick() {
	if (undefined === batteryCharacteristic) return;

	batteryCharacteristic.readValue()
	.then(value => {
		let batteryLevel = value.getUint8(0);
		log('> Battery Level is ' + batteryLevel + '%');
	})
	.catch(error => {
		log('Argh! ' + error);
	});
}

function handleNotifications(event) {
	let value = event.target.value;
	log(`> ${value.getUint16(0).toString(10)}`);
}