define([
  "jquery",
  "esri/widgets/Zoom/ZoomViewModel",
  "jquery-ui",
  "bootstrap"
], function(
  $,
  ZoomViewModel
) {

  $.widget("demo.zoom", {

    //--------------------------------------------------------------------------
    //
    //  Lifecycle
    //
    //--------------------------------------------------------------------------

    _create: function() {
      var viewModel = new ZoomViewModel();

      this._setOptions({

        // set viewModel first for delegates
        viewModel: viewModel,

        view: this.options.view
      });

      this._handles = [
        viewModel.watch("canZoomIn, canZoomOut, layout, state", function() {
          this._updateUI();
        }.bind(this))
      ];

      this._initUI();
      this._updateUI();
    },

    //--------------------------------------------------------------------------
    //
    //  Variables
    //
    //--------------------------------------------------------------------------

    _delegated: [
      "view"
    ],

    _handles: null,

    _parts: null,

    //--------------------------------------------------------------------------
    //
    //  Public Properties
    //
    //--------------------------------------------------------------------------

    defaultElement: "<div></div>",

    options: {
      classes: {
        root: "demo-zoom",
        horizontal: "btn-group",
        vertical: "btn-group-vertical",

        // common
        disabled: "esri-disabled"
      },
      layout: "vertical"
    },

    _setOption: function(key, value) {
      if (this._delegated.indexOf(key) === -1) {
        this._super(key, value);
      }

      this._handleDelegatedProp(key, value);
    },

    view: function(value) {
      return this._handleDelegatedProp("view", value);
    },

    //--------------------------------------------------------------------------
    //
    //  Public Methods
    //
    //--------------------------------------------------------------------------

    zoomIn: function() {
      this.options.viewModel.zoomIn();
    },

    zoomOut: function() {
      this.options.viewModel.zoomOut();
    },

    //--------------------------------------------------------------------------
    //
    //  Overridden Methods
    //
    //--------------------------------------------------------------------------

    _destroy: function() {
      this.options.viewModel.destroy();
      this.options.viewModel = null;

      this._handles.forEach(function(handle) {
        handle.remove();
      });
      this._handles = null;

      this.element.remove();
    },

    //--------------------------------------------------------------------------
    //
    //  Private Methods
    //
    //--------------------------------------------------------------------------

    _handleDelegatedProp: function(name, value, target) {
      var target = target || this.options.viewModel;

      if (value === undefined) {
        return target[name];
      }

      target[name] = value;
      return this;
    },

    _initUI: function() {
      var zoomInButton = this._createZoomButton("Zoom In", "+", this.zoomIn.bind(this));
      var zoomOutButton = this._createZoomButton("Zoom Out", "–", this.zoomOut.bind(this));

      this.element
        .addClass(this.options.classes.root)
        .append(
          zoomInButton,
          zoomOutButton
        );

      this._parts = {
        zoomInButton: zoomInButton,
        zoomOutButton: zoomOutButton
      };
    },

    _updateUI: function() {
      var options = this.options;
      var vm = options.viewModel;
      var isHorizontal = options.layout === "horizontal";
      var parts = this._parts;
      var elem = this.element;

      elem.toggleClass(options.classes.disabled, vm.state === "disabled");
      elem.toggleClass(options.classes.vertical, !isHorizontal);
      elem.toggleClass(options.classes.horizontal, isHorizontal);

      parts.zoomInButton.prop("disabled", !vm.canZoomIn);
      parts.zoomOutButton.prop("disabled", !vm.canZoomOut);
    },

    _createZoomButton: function(title, content, action) {
      return $("<button>")
        .addClass("btn btn-default")
        .text(content)
        .attr({
          title: title
        })
        .click(action);
    }

  });

});
