function log() {
	let line = Array.prototype.slice.call(arguments).map(function(argument) {
		return typeof argument === 'string' ? argument : JSON.stringify(argument);
	}).join(' ');

	document.querySelector('#log').textContent += line + '\n';
};

function clearLog() {
	document.querySelector('#log').textContent = '';
}

function setStatus(status) {
	document.querySelector('#status').textContent = status;
}

function setContent(newContent) {
	let content = document.querySelector('#content');
  	while(content.hasChildNodes()) {
    	content.removeChild(content.lastChild);
  	}
  	content.appendChild(newContent);
}