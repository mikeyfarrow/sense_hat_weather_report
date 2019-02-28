$(document).ready(function() {
    setInterval(getWeather, 3000);
});

function getWeather() {
    axios
        .get('/all')
        .then(function(response) {
            console.log(response.data);

            var temps = response.data.rows;
            var rows = temps.map(
                d => $('<tr>')
                    .append($('<td>').text(d.time_recorded))
                    .append($('<td>').text(d.pressure.toFixed(1)))
                    .append($('<td>').text(`${d.humidity.toFixed(1)}%`))
                    .append($('<td>').text(cToF(d.temp_from_pressure)))
                    .append($('<td>').text(cToF(d.temp_from_humidity)))
            );

            $('#data tbody')
                .text('')
                .append(rows);


            // $('#data').text('');
            // $('#data').text(
            //     response.data.rows
            //         .map(obj => `${obj.time_recorded}, ${obj.pressure}, ${obj.humidity}, ${obj.temp_from_pressure}, ${obj.temp_from_humidity}`)
            //         .join('\n')
            // );
        })
}

function cToF(tempC) {
    return (tempC * (9/5) + 32).toFixed(1);
}