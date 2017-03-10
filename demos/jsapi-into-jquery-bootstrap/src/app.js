define([
  "jquery",

  "esri/Map",
  "esri/layers/GraphicsLayer",
  "esri/views/MapView",
  "esri/Graphic",
  "esri/geometry/Point",
  "esri/geometry/Polyline",
  "esri/symbols/PictureMarkerSymbol",
  "esri/symbols/SimpleLineSymbol"/*,
  "jquery.easing"*/
], function(
  $,
  Map, GraphicsLayer, MapView,
  Graphic, Point, Polyline, PictureMarkerSymbol, SimpleLineSymbol
) {

  // init app when document is ready
  $(initApp);

  function initApp() {
    var photoUrlKey;
    // set up our map

    var map = new Map({
      basemap: "topo"
    });

    var graphicsLayer = new GraphicsLayer();

    map.add(graphicsLayer);

    // create view
    var view = new MapView({
      map: map,
      container: "view-div",
      zoom: 14,
      center: [-116.51327133175782, 33.82029520464912]
    });

    view.then(function() {
      view.popup.dockEnabled = true;
    });

    view.on('click', function(evt){
      var screenPoint = {
        x: evt.x,
        y: evt.y
      }
      view.goTo(screenPoint);
      view.hitTest(screenPoint)
        .then(showImage);
    });

    function showImage(response){
      console.dir(response);
      var graphic = response.results[0].graphic;
      if(graphic) {
        var img_url = graphic.attributes.urls[photoUrlKey];
        var caption = graphic.attributes.caption;

        var new_image = $('.current-image').attr('src', img_url);
      }
    }
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

        // graphicsLayer.addMany(
          data.photos.map(function(photo) {
            photoUrlKey = Object.keys(photo.urls)[0];
            var photoUrl = photo.urls[photoUrlKey];

            // place photos on map PictureMarkerSymbols
            var graphic = new Graphic({
              attributes: photo,
              geometry: new Point(latLong2LongLat(photo.location)),
              symbol: new PictureMarkerSymbol({
                url: photoUrl
              }),
              popupTemplate: {
                content: [{
                  type: "media",
                  mediaInfos: [{
                    type: "image",
                    value: {
                      sourceURL: photoUrl
                    },
                    caption: photo.caption
                  }]
                }]
              }
            });
            graphicsLayer.add(graphic);

            $('#img-container').append('<div class="col-md-2"><a href="" class="thumbnail"><img src="' + photoUrl + '"/></a></div>');
          })
        // );
      });

    $(".page-scroll").on('click', function() {
        $('html, body').animate({
            scrollTop: $("#img-container").offset().top
        }, 1500);
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
