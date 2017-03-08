var strava = require("strava-v3");
var express = require("express");
var app = express();

var fs = require('fs');
var config = JSON.parse(fs.readFileSync('data-config.json', 'utf8'));

var activityId = config.activityId;
var accessToken = config.accessToken;

app.get("/activity", function(req, res) {

  strava.activities.get({
    "id": activityId,
    "access_token": accessToken
  }, function(error, payload) {
    if (error) {
      res.jsonp(error);
      return;
    }

    res.jsonp(payload);
  });

});

app.get("/photos", function(req, res) {

  strava.activities.listPhotos({
    "id": activityId,
    "source": 1,
    "access_token": accessToken
  }, function(error, payload) {
    if (error) {
      res.jsonp(error);
      return;
    }

    res.jsonp(payload);
  });

});

app.listen(3000, function() {
  console.log("listening...");
});
