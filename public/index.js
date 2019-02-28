$(document).ready(function() {
    setInterval(getWeather, 3000);
});

function getWeather() {
    axios
        .get('/all')
        .then(function(response) {
            console.log(response.data);
            $('#data').text('');
            $('#data').text(
                response.data.rows
                    .map(obj => `${obj.time_recorded}, ${obj.pressure}, ${obj.humidity}, ${obj.temp_from_pressure}, ${obj.temp_from_humidity}`)
                    .join('\n')
            );
        })
}