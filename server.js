/**
 * Created by davej on 3/1/2018.
 */
const express = require('express'),
    bodyParser = require("body-parser"),
    crawler = require('./crawler.js'),
    _ = require('lodash');

const app = express();


app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

app.use(require("express-session")({
    secret: "Once again Rusty wins cutest!",
    resave: false,
    saveUninitialized: false
}));


app.get('/', function (req, res) {
    res.render('index', {searchWord: "", locations: req.session.locations, res: null, err: null});
})


app.post('/weather', function (req, res) {
    var city = req.body.city,
        values = {searchWord: city, locations: req.session.locations, res: null, err: null};
    crawler.scrapeWeather(req.body, function (err, info) {
        if (err) {
            values.err = "No results for \"" + city + "\"";
            res.render('index', values);
        }
        else {
            //if current search was not added
            if (!_.find(req.session.locations, ['link', info.link])) {
                info.new = true;
            }
            values.res = info;
            res.render('index', values);
        }
    });
})


app.post('/weather/locations', function (req, res) {
    if (req.session.locations == null) {
        req.session.locations = [];
    }
    if (!_.find(req.session.locations, ['link', req.body.link])) {
        req.session.locations.push(req.body);
    }
    res.render('index', {searchWord: "",
        locations: req.session.locations,
        res: null,
        err: null
    });

});

app.get('*', function (req, res) {
    res.render('index', {
        searchWord: "",
        locations: req.session.locations,
        res: null,
        err: null
    });
})

app.listen(app.get('port'), function () {
    console.log('Node app is running on port', app.get('port'));
});
