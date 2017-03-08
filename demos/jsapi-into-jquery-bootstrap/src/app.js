define([
  "jquery",

  "esri/Map",
  "esri/layers/GraphicsLayer",
  "esri/views/MapView",
  "esri/Graphic",
  "esri/geometry/Point",
  "esri/geometry/Polyline",
  "esri/symbols/PictureMarkerSymbol",
  "esri/symbols/SimpleLineSymbol"
], function(
  $,
  Map, GraphicsLayer, MapView,
  Graphic, Point, Polyline, PictureMarkerSymbol, SimpleLineSymbol
) {

  // init app when document is ready
  $(initApp);

  function initApp() {

    // set up our map

    var map = new Map({
      basemap: "topo"
    });

    var graphicsLayer = new GraphicsLayer();

    map.add(graphicsLayer);

    // create and append view via $

    var viewDiv = $("<div></div>")
      .addClass("viewDiv")
      .appendTo("body");

    var view = new MapView({
      map: map,
      container: viewDiv[0]
    });

    // fetch ride data

    $.ajax({
        url: "//localhost:3000/activity",
        dataType: "jsonp",
        crossDomain: true,
        jsonpCallback: "callback"
      })
      .then(function(activity) {

        return $.ajax({
            url: "//localhost:3000/photos",
            dataType: "jsonp",
            crossDomain: true,
            jsonpCallback: "callback"
          })
          .then(function(photos) {
            return {
              activity: activity,
              photos: photos
            }
          });
      })
      .then(function(data) {

        var ridePolyline = new Polyline({
          paths: decodeLine(data.activity.map.polyline)
            .map(latLong2LongLat)
        });

        graphicsLayer.add(
          new Graphic({
            geometry: ridePolyline,
            symbol: new SimpleLineSymbol({
              color: [255, 97, 56],
              width: 4
            })
          })
        );

        // zoom to ride extent

        view.goTo({
          target: ridePolyline
        });

        graphicsLayer.addMany(
          data.photos.map(function(photo) {

            // place photos on map PictureMarkerSymbols
            return new Graphic({
              attributes: photo,
              geometry: new Point(latLong2LongLat(photo.location)),
              symbol: new PictureMarkerSymbol({
                url: photo.urls[0]
              }),
              popupTemplate: {
                content: [{
                  type: "media",
                  mediaInfos: [{
                    type: "image",
                    value: {
                      sourceURL: photo.urls[0]
                    },
                    caption: photo.caption
                  }]
                }]
              }
            });
          })
        );

      });

    // utilities

    // https://roconmachine.wordpress.com/2012/05/07/decoding-google-direction-response-polyline-javascript/
    function decodeLine(encoded) {
      var len = encoded.length;
      var index = 0;
      var array = [];
      var lat = 0;
      var lng = 0;

      while (index < len) {
        var b;
        var shift = 0;
        var result = 0;
        do {
          b = encoded.charCodeAt(index++) - 63;
          result |= (b & 0x1f) << shift;
          shift += 5;
        } while (b >= 0x20);
        var dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
        lat += dlat;

        shift = 0;
        result = 0;
        do {
          b = encoded.charCodeAt(index++) - 63;
          result |= (b & 0x1f) << shift;
          shift += 5;
        } while (b >= 0x20);
        var dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
        lng += dlng;

        array.push([lat * 1e-5, lng * 1e-5]);
      }

      return array;
    }

    function latLong2LongLat(latLong) {
      return [
        latLong[1],
        latLong[0]
      ];
    }
  }

});
