/* https://googlechrome.github.io/samples/web-bluetooth/notifications.html */
/* https://github.com/GoogleChrome/samples/blob/gh-pages/web-bluetooth/notifications.js */

var startNotificationsButton = document.querySelector('#startNotifications');
var stopNotificationsButton = document.querySelector('#stopNotifications');

startNotificationsButton.addEventListener('click', function(event) {
	event.stopPropagation();
	event.preventDefault();
	clearLog();
	onStartButtonClick();
});

stopNotificationsButton.addEventListener('click', function(event) {
	event.stopPropagation();
	event.preventDefault();
	onStopButtonClick();
});

var myCharacteristic;
function onStartButtonClick() {
	let serviceUuid = 0x180D;
	let characteristicUuid = 0x2A37;

	startNotificationsButton.disabled = true;
	stopNotificationsButton.disabled = false;

	log('Requesting Bluetooth Device...');
	navigator.bluetooth.requestDevice({filters: [{services: [serviceUuid]}]})
	.then(device => {
		log('Connecting to GATT Server...');
		return device.gatt.connect();
	})
	.then(server => {
		log('Getting Service...');
		return server.getPrimaryService(serviceUuid);
	})
	.then(service => {
		log('Getting Characteristic...');
		return service.getCharacteristic(characteristicUuid);
	})
	.then(characteristic => {
		myCharacteristic = characteristic;
		return myCharacteristic.startNotifications().then(_ => {
			log('> Notifications started');
			myCharacteristic.addEventListener('characteristicvaluechanged', handleNotifications);
		});
	})
	.catch(error => {
		log('Argh! ' + error);
	});
}

function onStopButtonClick() {
	if (myCharacteristic) {
		myCharacteristic.stopNotifications()
		.then(_ => {
			log('> Notifications stopped');
			myCharacteristic.removeEventListener('characteristicvaluechanged', handleNotifications);
		})
		.catch(error => {
			log('Argh! ' + error);
		});
	}
	startNotificationsButton.disabled = false;
	stopNotificationsButton.disabled = true;
}

function handleNotifications(event) {
	let value = event.target.value;
	log(`> ${value.getUint16(0).toString(10)}`);
}