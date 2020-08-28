/* https://googlechrome.github.io/samples/web-bluetooth/notifications.html */
/* https://github.com/GoogleChrome/samples/blob/gh-pages/web-bluetooth/notifications.js */
/* https://googlechrome.github.io/samples/web-bluetooth/discover-services-and-characteristics.html?optionalServices=0x180F */
let log = console.log;

var connectButton = document.querySelector('#connect');

const hrmServiceUuid = 0x180D;
const hrmCharacteristicUuid = 0x2A37;
const batteryServiceUuid = 0x180F;
const batteryCharacteristicUuid = 0x2A19;
let hrmCharacteristic, batteryCharacteristic;

connectButton.addEventListener('click', function(event) {
	event.stopPropagation();
	event.preventDefault();
	onConnectButtonClick();
});

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
	connectButton.disabled = true;

	log('Requesting Bluetooth Device...');
	navigator.bluetooth.requestDevice({filters: [{services: [hrmServiceUuid, batteryServiceUuid]}]})
	.then(device => {
		log('Connecting to GATT Server...');
		return device.gatt.connect();
	})
  	.then(server => {
  		log('Connected.')
		return server.getPrimaryServices();
  	})
  	.then(services => {
		log('Getting Characteristics...');
		let queue = Promise.resolve();
		services.forEach(service => {
		  queue = queue.then(_ => service.getCharacteristics().then(characteristics => {
			log('> Service: ' + service.uuid);
			characteristics.forEach(characteristic => {
				log('>> Characteristic: ' + characteristic.uuid + ' ' + getSupportedProperties(characteristic));
				if (characteristic.uuid.indexOf(hrmCharacteristicUuid.toString(16)) > -1) {
					hrmCharacteristic = characteristic;
					onStartButtonClick();
				}
				// else if (characteristic.uuid.indexOf(batteryCharacteristicUuid.toString(16)) > -1) {
				// 	batteryCharacteristic = characteristic;
				// }
			});
		  }));
		});
		return queue;
	})
	.catch(error => {
		log('Argh! ' + error);
		connectButton.disabled = false;
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

function handleNotifications(event) {
	let value = event.target.value;
	document.getElementById("heartrate").innerHTML = `<h1>${value.getUint16(0)}</h1>BPM`;
}