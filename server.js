const express = require("express")
const mysql = require('mysql')
var url = require('url');
var bodyParser = require('body-parser'); // Create application/x-www-form-urlencoded parser (for POST)

const app = express()

// Create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); // for reading JSON

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'jani',
    password: 'passujani',
    database: "example_db"
});

connection.connect(function(err) {
    if (err) throw err
    console.log("Connected to MySQL!")
})

var util = require('util'); // for async calls
// node native promisify
const query = util.promisify(connection.query).bind(connection); // is bind needed?


app.get('/listofevents.html', function (req, res) {
    res.sendFile( __dirname + "/" + "listofevents.html" );
})


// parametrien kirjoitustapa selaimessa : http://localhost:8080/api/events?start=2021-01-01&end=2021-11-29
app.get("/api/events", function (req, res) {
    console.log("Get events from a certain period");
    //const baseURL = 'http://' + req.headers.host + '/';
    //const q = new URL(req.url, baseURL);
    var q = url.parse(req.url, true).query;
    //var params = q.start + " " + q.end;
    var startDate = q.start;
    var endDate = q.end;
    var string;
    //res.send("Getting events: "+params);
    var sql = "SELECT event_date.Date, event.Name, event.Type, Location.Location_name"
        + " FROM event_date, event, location"
        + " WHERE event_date.Event_id = event.Event_id and event.Location_Location_id = Location.Location_id"
        + " and event_date.Date >= ? and event_date.Date <= ?"
        + " GROUP BY Name"
        + " ORDER BY event_date.Date";

    (async () => { // IIFE (Immediately Invoked Function Expression)
        try {
            const rows = await query(sql,[startDate, endDate]);
            string = JSON.stringify(rows);
            console.log(string);
            res.send(string);
        }
        catch (err) {
            console.log("Database error!"+ err);
        }
        finally {
            //connection.end();
        }
    })()
});

app.get("/api/location", function (req, res) {
    console.log("Get location's address");
    //const baseURL = 'http://' + req.headers.host + '/';
    //const q = new URL(req.url, baseURL);
    var q = url.parse(req.url, true).query;
    //var params = q.start + " " + q.end;
    var location = q.chosenLocation;
    var string;
    //res.send("Getting events: "+params);
    var sql = "SELECT Street_Address"
        + " FROM location"
        + " WHERE Location_name = ?";

    (async () => { // IIFE (Immediately Invoked Function Expression)
        try {
            const rows = await query(sql,[q.location]);
            string = JSON.stringify(rows);
            console.log(rows);
            res.send(string);
            console.log("Address: " + string);
        }
        catch (err) {
            console.log("Database error!"+ err);
        }
        finally {
            //connection.end();
        }
    })()
});








app.post("/api/testingevent", urlencodedParser, function (req, res) {
    //console.log("Request body: " + req.body);
    //console.log("Request body length: " + req.body.getLength);

    console.log("body: %j", req.body);
    // get JSON-object from the http-body
    let jsonObj = req.body;
    console.log("Arvo: "+jsonObj.eventName);
    // make updates to the database
    let responseString = JSON.stringify(jsonObj)
    res.send("POST succesful: "+ responseString);
});

const port = 8080
app.listen(port, () => console.log(`Server started on port ${port}`))