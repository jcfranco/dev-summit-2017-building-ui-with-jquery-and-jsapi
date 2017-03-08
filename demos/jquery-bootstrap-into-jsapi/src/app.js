define([
  "jquery",

  "esri/Map",
  "esri/views/MapView",

  // required so they can register to $
  "./BasemapToggle",
  "./Zoom",

  // helps ensure page is fully loaded before proceeding
  "dojo/domReady!"
],
function(
  $,
  Map,
  MapView
) {

  // set up map

  var map = new Map({
    basemap: "gray"
  });

  var view = new MapView({
    map: map,
    container: "viewDiv",
    ui: {
      components: []
    },
    zoom: 14,
    center: [
      -116.51327133175782,
      33.82029520464912
    ]
  });

  // create our custom widgets

  var basemapToggle = $.demo.basemaptoggle({
      nextBasemap: "topo",
      view: view
    })
    .widget();

  var zoom = $.demo.zoom({
      view: view
    })
    .widget();

  // add widget element to the view UI

  view.ui.add(basemapToggle.get(0), "top-right");
  view.ui.add(zoom.get(0), "top-left");

});
