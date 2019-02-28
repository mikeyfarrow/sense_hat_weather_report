const express = require('express');
const sqlite3 = require('sqlite3');
var request = require('request');

const port = 8080;
const app = express();
const db = new sqlite3.Database(':memory:');
const AUTUMN_PHONE_NUMBER = '2533022119';

if (!process.argv[2]) {
    console.log('provide textbelt key');
    process.exit(1);
}
const TEXTBELT_KEY = process.argv[2];

var bodyParser = require('body-parser')
app.use(express.static('public')); // serve the contents of the public folder
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({
    extended: true
})); // for URL-encoded bodies


initializeDb();

app.get('/all', (req, res) => {
    db.all(`SELECT * FROM Environment`, (err, rows) => {
        if (err) {
            console.log(err);
            res.send({
                ok: false,
                message: err
            });
        } else {
            res.send({
                ok: true,
                rows: rows
            });
        }
    })
});

app.post('/record', (req, res) => {
    console.log(req.body);

    if (!verifyData(req.body)) {
        res.send({
            ok: false,
            message: `POST data must include properties: temp_from_humidity, temp_from_pressure, pressure, and humidity`
        })
        return;
    }

    // insert into the DB
    db.run(
        `INSERT INTO Environment (humidity, pressure, temp_from_pressure, temp_from_humidity) VALUES (?,?,?,?)`,
        req.body.humidity,
        req.body.pressure,
        req.body.temp_from_pressure,
        req.body.temp_from_humidity,
        (err) => {
            res.send({
                ok: true,
                message: req.body
            });
        });

    request.post('https://textbelt.com/text', {
            form: {
                phone: AUTUMN_PHONE_NUMBER,
                message: `The temperature has reached ${req.body.temp_from_pressure}. View the data here: http://10.0.0.222:8080`,
                key: TEXTBELT_KEY,
            },
        },
        function (err, httpResponse, body) {
            if (err) {
                console.error('Error:', err);
                return;
            }
            console.log(JSON.parse(body));
        })
});



function verifyData(data) {
    const props = ["temp_from_humidity", "temp_from_pressure", "pressure", "humidity"];
    for (var prop of props) {
        if (data[prop] == undefined)
            return false
    }
    return true;
}


function initializeDb() {
    var createTable = `CREATE TABLE IF NOT EXISTS Environment (
        time_recorded TEXT DEFAULT CURRENT_TIMESTAMP,
        humidity REAL,
        pressure REAL,
        temp_from_pressure REAL,
        temp_from_humidity REAL
    );`;

    db.run(createTable, err => {
        if (err)
            console.log(err);
        else
            startServer();
    });
}

function startServer() {
    app.listen(port, () => {
        console.log(`Listening on http://localhost:${port}`);
    });
}