/**
 * videojs-playlist-ui
 * @version 3.0.6
 * @copyright 2017 Brightcove, Inc.
 * @license Apache-2.0
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('video.js')) :
	typeof define === 'function' && define.amd ? define(['video.js'], factory) :
	(factory(global.videojs));
}(this, (function (videojs) { 'use strict';

videojs = 'default' in videojs ? videojs['default'] : videojs;

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

var empty = {};


var empty$1 = (Object.freeze || Object)({
	'default': empty
});

var minDoc = ( empty$1 && empty ) || empty$1;

var topLevel = typeof commonjsGlobal !== 'undefined' ? commonjsGlobal :
    typeof window !== 'undefined' ? window : {};


var doccy;

if (typeof document !== 'undefined') {
    doccy = document;
} else {
    doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'];

    if (!doccy) {
        doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'] = minDoc;
    }
}

var document_1 = doccy;

var win;

if (typeof window !== "undefined") {
    win = window;
} else if (typeof commonjsGlobal !== "undefined") {
    win = commonjsGlobal;
} else if (typeof self !== "undefined"){
    win = self;
} else {
    win = {};
}

var window_1 = win;

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};











var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};











var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

// support VJS5 & VJS6 at the same time
var dom = videojs.dom || videojs;
var registerPlugin = videojs.registerPlugin || videojs.plugin;

// Array#indexOf analog for IE8
var indexOf = function indexOf(array, target) {
  for (var i = 0, length = array.length; i < length; i++) {
    if (array[i] === target) {
      return i;
    }
  }
  return -1;
};

// see https://github.com/Modernizr/Modernizr/blob/master/feature-detects/css/pointerevents.js
var supportsCssPointerEvents = function () {
  var element = document_1.createElement('x');

  element.style.cssText = 'pointer-events:auto';
  return element.style.pointerEvents === 'auto';
}();

var defaults$$1 = {
  className: 'vjs-playlist',
  playOnSelect: false,
  supportsCssPointerEvents: supportsCssPointerEvents
};

// we don't add `vjs-playlist-now-playing` in addSelectedClass
// so it won't conflict with `vjs-icon-play
// since it'll get added when we mouse out
var addSelectedClass = function addSelectedClass(el) {
  el.addClass('vjs-selected');
};
var removeSelectedClass = function removeSelectedClass(el) {
  el.removeClass('vjs-selected');

  if (el.thumbnail) {
    dom.removeClass(el.thumbnail, 'vjs-playlist-now-playing');
  }
};

var upNext = function upNext(el) {
  el.addClass('vjs-up-next');
};
var notUpNext = function notUpNext(el) {
  el.removeClass('vjs-up-next');
};

var createThumbnail = function createThumbnail(thumbnail) {
  if (!thumbnail) {
    var placeholder = document_1.createElement('div');

    placeholder.className = 'vjs-playlist-thumbnail vjs-playlist-thumbnail-placeholder';
    return placeholder;
  }

  var picture = document_1.createElement('picture');

  picture.className = 'vjs-playlist-thumbnail';

  if (typeof thumbnail === 'string') {
    // simple thumbnails
    var img = document_1.createElement('img');

    img.src = thumbnail;
    img.alt = '';
    picture.appendChild(img);
  } else {
    // responsive thumbnails

    // additional variations of a <picture> are specified as
    // <source> elements
    for (var i = 0; i < thumbnail.length - 1; i++) {
      var _variant = thumbnail[i];
      var source = document_1.createElement('source');

      // transfer the properties of each variant onto a <source>
      for (var prop in _variant) {
        source[prop] = _variant[prop];
      }
      picture.appendChild(source);
    }

    // the default version of a <picture> is specified by an <img>
    var variant = thumbnail[thumbnail.length - 1];
    var _img = document_1.createElement('img');

    _img.alt = '';
    for (var _prop in variant) {
      _img[_prop] = variant[_prop];
    }
    picture.appendChild(_img);
  }
  return picture;
};

var Component = videojs.getComponent('Component');

var PlaylistMenuItem = function (_Component) {
  inherits(PlaylistMenuItem, _Component);

  function PlaylistMenuItem(player, playlistItem, settings) {
    classCallCheck(this, PlaylistMenuItem);

    if (!playlistItem.item) {
      throw new Error('Cannot construct a PlaylistMenuItem without an item option');
    }

    var _this = possibleConstructorReturn(this, _Component.call(this, player, playlistItem));

    _this.item = playlistItem.item;

    _this.playOnSelect = settings.playOnSelect;

    _this.emitTapEvents();

    _this.on(['click', 'tap'], _this.switchPlaylistItem_);
    _this.on('keydown', _this.handleKeyDown_);

    return _this;
  }

  PlaylistMenuItem.prototype.handleKeyDown_ = function handleKeyDown_(event) {
    // keycode 13 is <Enter>
    // keycode 32 is <Space>
    if (event.which === 13 || event.which === 32) {
      this.switchPlaylistItem_();
    }
  };

  PlaylistMenuItem.prototype.switchPlaylistItem_ = function switchPlaylistItem_(event) {
    this.player_.playlist.currentItem(indexOf(this.player_.playlist(), this.item));
    if (this.playOnSelect) {
      this.player_.play();
    }
  };

  PlaylistMenuItem.prototype.createEl = function createEl() {
    var li = document_1.createElement('li');
    var item = this.options_.item;

    li.className = 'vjs-playlist-item';
    li.setAttribute('tabIndex', 0);

    // Thumbnail image
    this.thumbnail = createThumbnail(item.thumbnail);
    li.appendChild(this.thumbnail);

    // Duration
    if (item.duration) {
      var duration = document_1.createElement('time');
      var time = videojs.formatTime(item.duration);

      duration.className = 'vjs-playlist-duration';
      duration.setAttribute('datetime', 'PT0H0M' + item.duration + 'S');
      duration.appendChild(document_1.createTextNode(time));
      li.appendChild(duration);
    }

    // Now playing
    var nowPlayingEl = document_1.createElement('span');
    var nowPlayingText = this.localize('Now Playing');

    nowPlayingEl.className = 'vjs-playlist-now-playing-text';
    nowPlayingEl.appendChild(document_1.createTextNode(nowPlayingText));
    nowPlayingEl.setAttribute('title', nowPlayingText);
    this.thumbnail.appendChild(nowPlayingEl);

    // Title container contains title and "up next"
    var titleContainerEl = document_1.createElement('div');

    titleContainerEl.className = 'vjs-playlist-title-container';
    this.thumbnail.appendChild(titleContainerEl);

    // Up next
    var upNextEl = document_1.createElement('span');
    var upNextText = this.localize('Up Next');

    upNextEl.className = 'vjs-up-next-text';
    upNextEl.appendChild(document_1.createTextNode(upNextText));
    upNextEl.setAttribute('title', upNextText);
    titleContainerEl.appendChild(upNextEl);

    // Video title
    var titleEl = document_1.createElement('cite');
    var titleText = item.name || this.localize('Untitled Video');

    titleEl.className = 'vjs-playlist-name';
    titleEl.appendChild(document_1.createTextNode(titleText));
    titleEl.setAttribute('title', titleText);
    titleContainerEl.appendChild(titleEl);

    return li;
  };

  return PlaylistMenuItem;
}(Component);

var PlaylistMenu = function (_Component2) {
  inherits(PlaylistMenu, _Component2);

  function PlaylistMenu(player, settings) {
    classCallCheck(this, PlaylistMenu);

    if (!player.playlist) {
      throw new Error('videojs-playlist is required for the playlist component');
    }

    var _this2 = possibleConstructorReturn(this, _Component2.call(this, player, settings));

    _this2.items = [];

    // If CSS pointer events aren't supported, we have to prevent
    // clicking on playlist items during ads with slightly more
    // invasive techniques. Details in the stylesheet.
    if (settings.supportsCssPointerEvents) {
      _this2.addClass('vjs-csspointerevents');
    }

    _this2.createPlaylist_();

    if (!videojs.browser.TOUCH_ENABLED) {
      _this2.addClass('vjs-mouse');
    }

    player.on(['loadstart', 'playlistchange'], function (event) {
      _this2.update();
    });

    // Keep track of whether an ad is playing so that the menu
    // appearance can be adapted appropriately
    player.on('adstart', function () {
      _this2.addClass('vjs-ad-playing');
    });

    player.on('adend', function () {
      _this2.removeClass('vjs-ad-playing');
    });
    return _this2;
  }

  PlaylistMenu.prototype.createEl = function createEl() {
    var settings = this.options_;

    if (settings.el) {
      return settings.el;
    }

    var ol = document_1.createElement('ol');

    ol.className = settings.className;
    settings.el = ol;
    return ol;
  };

  PlaylistMenu.prototype.createPlaylist_ = function createPlaylist_() {
    var playlist = this.player_.playlist() || [];
    var list = this.el_.querySelector('.vjs-playlist-item-list');
    var overlay = this.el_.querySelector('.vjs-playlist-ad-overlay');

    if (!list) {
      list = document_1.createElement('ol');
      list.className = 'vjs-playlist-item-list';
      this.el_.appendChild(list);
    }

    // remove any existing items
    for (var i = 0; i < this.items.length; i++) {
      list.removeChild(this.items[i].el_);
    }
    this.items.length = 0;

    // create new items
    for (var _i = 0; _i < playlist.length; _i++) {
      var item = new PlaylistMenuItem(this.player_, {
        item: playlist[_i]
      }, this.options_);

      this.items.push(item);
      list.appendChild(item.el_);
    }

    // Inject the ad overlay. IE<11 doesn't support "pointer-events:
    // none" so we use this element to block clicks during ad
    // playback.
    if (!overlay) {
      overlay = document_1.createElement('li');
      overlay.className = 'vjs-playlist-ad-overlay';
      list.appendChild(overlay);
    } else {
      // Move overlay to end of list
      list.appendChild(overlay);
    }

    // select the current playlist item
    var selectedIndex = this.player_.playlist.currentItem();

    if (this.items.length && selectedIndex >= 0) {
      addSelectedClass(this.items[selectedIndex]);

      var thumbnail = this.items[selectedIndex].$('.vjs-playlist-thumbnail');

      if (thumbnail) {
        dom.addClass(thumbnail, 'vjs-playlist-now-playing');
      }
    }
  };

  PlaylistMenu.prototype.update = function update() {
    // replace the playlist items being displayed, if necessary
    var playlist = this.player_.playlist();

    if (this.items.length !== playlist.length) {
      // if the menu is currently empty or the state is obviously out
      // of date, rebuild everything.
      this.createPlaylist_();
      return;
    }

    for (var i = 0; i < this.items.length; i++) {
      if (this.items[i].item !== playlist[i]) {
        // if any of the playlist items have changed, rebuild the
        // entire playlist
        this.createPlaylist_();
        return;
      }
    }

    // the playlist itself is unchanged so just update the selection
    var currentItem = this.player_.playlist.currentItem();

    for (var _i2 = 0; _i2 < this.items.length; _i2++) {
      var item = this.items[_i2];

      if (_i2 === currentItem) {
        addSelectedClass(item);
        if (document_1.activeElement !== item.el()) {
          dom.addClass(item.thumbnail, 'vjs-playlist-now-playing');
        }
        notUpNext(item);
      } else if (_i2 === currentItem + 1) {
        removeSelectedClass(item);
        upNext(item);
      } else {
        removeSelectedClass(item);
        notUpNext(item);
      }
    }
  };

  return PlaylistMenu;
}(Component);

/**
 * Initialize the plugin.
 * @param options (optional) {object} configuration for the plugin
 */


var playlistUi = function playlistUi(options) {
  var player = this;
  var settings = void 0;
  var elem = void 0;

  if (!player.playlist) {
    throw new Error('videojs-playlist is required for the playlist component');
  }

  // if the first argument is a DOM element, use it to build the component
  if (typeof window_1.HTMLElement !== 'undefined' && options instanceof window_1.HTMLElement ||
  // IE8 does not define HTMLElement so use a hackier type check
  options && options.nodeType === 1) {
    elem = options;
    settings = videojs.mergeOptions(defaults$$1);
  } else {
    // lookup the elements to use by class name
    settings = videojs.mergeOptions(defaults$$1, options);
    elem = document_1.querySelector('.' + settings.className);
  }

  // build the playlist menu
  settings.el = elem;
  player.playlistMenu = new PlaylistMenu(player, settings);
};

// register components
videojs.registerComponent('PlaylistMenu', PlaylistMenu);
videojs.registerComponent('PlaylistMenuItem', PlaylistMenuItem);

// register the plugin
registerPlugin('playlistUi', playlistUi);

})));
