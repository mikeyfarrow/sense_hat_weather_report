$(document).ready(function() {
    axios
        .get('/all')
        .then(function(response) {
            console.log(response.data);
            $('#data').text(
                response.data.rows
                    .map(obj => `${obj.time_recorded}, ${obj.pressure}, ${obj.humidity}, ${obj.temp_from_pressure}, ${obj.temp_from_humidity}`)
                    .join('\n')
            );
        })
});