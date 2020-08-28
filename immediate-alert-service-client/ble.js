document.querySelector('#alert').addEventListener('click', function(event) {
	event.stopPropagation();
	event.preventDefault();
	onAlertButtonClick();
});

document.querySelector('#found').addEventListener('click', function(event) {
	event.stopPropagation();
	event.preventDefault();
	onFoundButtonClick();
});

const log = console.log;
const serviceUuid = 0x1802;
const alertCharacteristicUuid = 0x2A06;
let alertCharacteristic;

function onAlertButtonClick() {
	if (undefined === alertCharacteristic) {	
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
				if (characteristic.uuid.indexOf(alertCharacteristicUuid.toString(16)) > -1) {
					alertCharacteristic = characteristic;
					document.getElementById("alert").disabled = true;
					document.getElementById("found").disabled = false;
					let alert = Uint8Array.of(1);
					alertCharacteristic.writeValue(alert)
					.catch(error => {
						log('Error! ' + error);
					});
				}
				else {
					characteristic.startNotifications()
					.then(_ => {
						log('> Notifications started');
						characteristic.addEventListener('characteristicvaluechanged', handleNotifications);
					})
					.catch(error => {
						log('Error! ' + error);
					});
				}
			});
		})
		.catch(error => {
			log('Error! ' + error);
		});
	} else {
		document.getElementById("alert").disabled = true;
		document.getElementById("found").disabled = false;
		let alert = Uint8Array.of(1);
		alertCharacteristic.writeValue(alert)
		.catch(error => {
			log('Error! ' + error);
		});		
	}
}

function onFoundButtonClick() {
	document.getElementById("found").disabled = true;
	document.getElementById("alert").disabled = false;
	let alert = Uint8Array.of(0);
	alertCharacteristic.writeValue(alert)
	.catch(error => {
		log('Error! ' + error);
	});
}

function handleNotifications(event) {
	document.getElementById("found").disabled = true;
	document.getElementById("alert").disabled = false;	
}
