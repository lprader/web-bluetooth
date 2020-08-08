let chart = new Chart(document.getElementById("line-chart"), {
	type: 'line',
	data: {
		labels: [],
		datasets: [{ 
			data: [],
			label: "BPM",
			borderColor: "#3e95cd",
			fill: false
			}
		]
	},
	options: {
		responsive: true,
		animation: {
			duration: 0,
		},
		scales: {
			yAxes: [{
				ticks: {
					max: 80,
					min: 40,
					stepSize: 5
				}
			}],
		},
	}
});

let index = 0;
function addData(data) {
	let label = index++;
	chart.data.labels.push(label);
	if (index > 10) chart.data.labels.shift();
	chart.data.datasets.forEach((dataset) => {
		dataset.data.push(data);
		if (index > 10) dataset.data.shift();
	});
	chart.update();
}