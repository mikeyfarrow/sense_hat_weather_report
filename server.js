const express = require('express');
const sqlite3 = require('sqlite3');
var request = require('request');
const path = require('path');

const port = 8080;
const app = express();
const db = new sqlite3.Database(path.join(__dirname, 'data', 'weather.sqlt'));
const AUTUMN_PHONE_NUMBER = '2533022119';
const TEMPERATURE_BOUNDS = { min: 1.67, max: 26.6 } // 35F to 80F

if (!process.argv[2]) {
    console.log('provide textbelt key');
    process.exit(1);
}
const TEXTBELT_KEY = process.argv[2];

var bodyParser = require('body-parser')
app.use(express.static(path.join(__dirname, 'public'))); // serve the contents of the public folder
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({
    extended: true
})); // for URL-encoded bodies


initializeDb();

app.get('/all', (req, res) => {
    db.all(`SELECT * FROM Environment ORDER BY time_recorded DESC`, (err, rows) => {
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

        // checkTemp(req.body.temp_from_humidity);
});

function checkTemp(temp) {
    if (temp >= TEMPERATURE_BOUNDS.min && temp <= TEMPERATURE_BOUNDS.max) {
        console.log('no alert');
        return
    }

    
    db.get(`Select Cast ((
        JulianDay('now') - JulianDay(time_sent)
    ) * 24 As REAL) as elapsed FROM Alert ORDER BY elapsed ASC LIMIT 1`, (err, row) => {
        if (err) {
            console.log(err);
        } else {
            console.log(row);
            if (!row || row.elapsed > 1) { // if have not sent a text in the last hour
                sendText();
            } else {
                console.log('not texting -- already sent one this hour')
            }
        }
    })


}

function sendText(temp) {
    console.log(`!!! SENDING TEXT!!! The temperature has reached ${temp}.`);
    db.run('INSERT INTO Alert (phone_no) VALUES (?)', AUTUMN_PHONE_NUMBER);
    request.post('https://textbelt.com/text', {
        form: {
            phone: AUTUMN_PHONE_NUMBER,
            message: `The temperature has reached ${temp}.`,
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
}

function verifyData(data) {
    const props = ["temp_from_humidity", "temp_from_pressure", "pressure", "humidity"];
    for (var prop of props) {
        if (data[prop] == undefined)
            return false
    }
    return true;
}


function initializeDb() {
    var createEnvTable = `CREATE TABLE IF NOT EXISTS Environment (
        time_recorded TEXT DEFAULT CURRENT_TIMESTAMP,
        humidity REAL,
        pressure REAL,
        temp_from_pressure REAL,
        temp_from_humidity REAL
    );`;

    var createAlertTable = `CREATE TABLE IF NOT EXISTS Alert (
        time_sent TEXT DEFAULT CURRENT_TIMESTAMP,
        phone_no TEXT NOT NULL
    )`;

    const checkErr = err => {
        if (err)
            console.log(err);
        else
            startServer();
    };

    db.serialize(() => {
        db.run(createEnvTable);
        db.run(createAlertTable, checkErr);
    })

}

function startServer() {
    app.listen(port, () => {
        console.log(`Listening on http://localhost:${port}`);
    });
}