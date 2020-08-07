/* https://github.com/GoogleChrome/samples/blob/gh-pages/web-bluetooth/notifications.js */

function isWebBluetoothEnabled() {
  if (navigator.bluetooth) {
    return true;
  } else {
    log('Web Bluetooth API is not available.\n' + 'Please make sure the "Experimental Web Platform features" flag is enabled.');
    return false;
  }
}

document.querySelector('#startNotifications').addEventListener('click', function(event) {
  event.stopPropagation();
  event.preventDefault();

  if (isWebBluetoothEnabled()) {
    onStartButtonClick();
  }
});

document.querySelector('#stopNotifications').addEventListener('click', function(event) {
  event.stopPropagation();
  event.preventDefault();

  if (isWebBluetoothEnabled()) {
    onStopButtonClick();
  }
});

const log = console.log;

var myCharacteristic;

function onStartButtonClick() {
  let serviceUuid = 0x180D;
  let characteristicUuid = 0x2A37;

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
      myCharacteristic.addEventListener('characteristicvaluechanged',
          handleNotifications);
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
      myCharacteristic.removeEventListener('characteristicvaluechanged',
          handleNotifications);
    })
    .catch(error => {
      log('Argh! ' + error);
    });
  }
}

function handleNotifications(event) {
  let value = event.target.value;
  let a = [];
  // Convert raw data bytes to hex values just for the sake of showing something.
  // In the "real" world, you'd use data.getUint8, data.getUint16 or even
  // TextDecoder to process raw data bytes.
  for (let i = 0; i < value.byteLength; i++) {
    a.push('0x' + ('00' + value.getUint8(i).toString(16)).slice(-2));
  }
  log('> ' + a.join(' '));
  addData(parseInt(a[1], 16));
}