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
	let serviceUuid = 0x1809;
	let characteristicUuid = 0x2A1C;

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
	log(`> ${getFloatValue(value).toFixed(1)}`);
}

/* https://gist.github.com/mold/42935cb1bdda7ae9b3ec72e9d0fa8666 */
function getFloatValue(value) {
	let offset = 1;

    // if the last byte is a negative value (MSB is 1), the final float should be too
    const negative = value.getInt8(offset + 2) >>> 31;

    // this is how the bytes are arranged in the byte array/DataView buffer
    const [b0, b1, b2, exponent] = [
        // get first three bytes as unsigned since we only care about the last 8 bits of 32-bit js number returned by getUint8().
        // Should be the same as: getInt8(offset) & -1 >>> 24
        value.getUint8(offset),
        value.getUint8(offset + 1),
        value.getUint8(offset + 2),

        // get the last byte, which is the exponent, as a signed int since it's already correct
        value.getInt8(offset + 3)
    ];

    let mantissa = b0 | (b1 << 8) | (b2 << 16);
    if (negative) {
        // need to set the most significant 8 bits to 1's since a js number is 32 bits but our mantissa is only 24.
        mantissa |= 255 << 24;
    }

    return mantissa * Math.pow(10, exponent);
}

