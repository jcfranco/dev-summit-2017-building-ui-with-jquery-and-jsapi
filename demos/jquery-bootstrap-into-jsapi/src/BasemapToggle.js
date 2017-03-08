define([
  "jquery",
  "esri/widgets/BasemapToggle/BasemapToggleViewModel",
  "jquery-ui"
], function(
  $,
  BasemapToggleViewModel
) {

  $.widget("demo.basemaptoggle", {

    //--------------------------------------------------------------------------
    //
    //  Lifecycle
    //
    //--------------------------------------------------------------------------

    _create: function() {
      var viewModel = new BasemapToggleViewModel();

      this._setOptions({

        // set viewModel first for delegates
        viewModel: viewModel,

        activeBasemap: this.options.activeBasemap,
        nextBasemap: this.options.nextBasemap,
        view: this.options.view
      });

      this._handles = [
        viewModel.on("toggle", function() {
          this._trigger("toggle");
        }.bind(this)),

        viewModel.watch("state, activeBasemap, nextBasemap", function() {
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
      "activeBasemap",
      "nextBasemap",
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
        root: "demo-basemap-toggle esri-basemap-toggle esri-widget",
        container: "esri-basemap-toggle__container",
        overlay: "esri-basemap-toggle__image-overlay",
        title: "esri-basemap-toggle__title",
        titleVisible: "esri-basemap-toggle__title--visible",
        image: "esri-basemap-toggle__image",
        secondaryImage: "esri-basemap-toggle__image--secondary",

        // common
        disabled: "esri-disabled"
      },
      titleVisible: true
    },

    _setOption: function(key, value) {
      if (this._delegated.indexOf(key) === -1) {
        this._super(key, value);
      }

      this._handleDelegatedProp(key, value);
    },

    activeBasemap: function(value) {
      return this._handleDelegatedProp("activeBasemap", value);
    },

    nextBasemap: function(value) {
      return this._handleDelegatedProp("nextBasemap", value);
    },

    view: function(value) {
      return this._handleDelegatedProp("view", value);
    },

    viewModel: function(value) {
      return this._handleDelegatedProp("viewModel", value);
    },

    //--------------------------------------------------------------------------
    //
    //  Public Methods
    //
    //--------------------------------------------------------------------------

    toggle: function() {
      this.options.viewModel.toggle();
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
      var css = this.options.classes;

      var secondaryImage = $("<div></div>")
        .addClass(css.secondaryImage)
        .addClass(css.image);

      var title = $("<span></span>")
        .addClass(css.title);

      var primaryImage = $("<div></div>")
        .addClass(css.image);

      var primaryImageContainer = $("<div></div>")
        .addClass(css.container)
        .append(primaryImage)
        .append(
          $("<div></div>")
            .addClass(css.overlay)
            .append(title)
        );

      this.element
        .click(function() {
          this.toggle();
        }.bind(this))
        .keyup(function(event) {
          var code = event.which;
          var ENTER = 13;
          var SPACE = 32;

          if (code !== ENTER && code !== SPACE) {
            return;
          }

          this.toggle();
        }.bind(this))
        .addClass(css.root)
        .attr({
          role: "button",
          tabIndex: 0,
          title: "Toggle"
        })
        .append(
          primaryImageContainer, secondaryImage
        );

      this._parts = {
        primaryImage: primaryImage,
        secondaryImage: secondaryImage,
        title: title
      };
    },

    _updateUI: function() {
      var options = this.options;
      var parts = this._parts;
      var vm = options.viewModel;
      var state = vm.state;

      this.element.toggleClass(options.classes.disabled, state === "disabled");

      parts.title.css("display", options.titleVisible ? "block" : "");

      var activeBasemap = vm.activeBasemap;
      var nextBasemap = vm.nextBasemap;

      if (!nextBasemap || !activeBasemap) {
        return;
      }

      parts.primaryImage.css(
        "background-image",
        nextBasemap.thumbnailUrl ? "url(" + nextBasemap.thumbnailUrl + ")" : ""
      );

      parts.secondaryImage.css(
        "background-image",
        activeBasemap.thumbnailUrl ? "url(" + activeBasemap.thumbnailUrl + ")" : ""
      );

      parts.title
        .attr("title", activeBasemap.title || "")
        .text(nextBasemap.title || "");
    }

  });

});
