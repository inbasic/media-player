/* global videojs */
'use strict';

{
  const Plugin = videojs.getPlugin('plugin');

  class HistoryPlugin extends Plugin {
    constructor(player, options) {
      super(player, options);

      const cache = {};
      if (chrome.storage) {
        chrome.storage.local.get({
          cache: {}
        }, prefs => Object.assign(cache, prefs.cache));
      }

      const save = () => chrome.runtime.sendMessage({
        method: 'save-cache',
        cache
      });

      const read = (prefs, callback) => {
        chrome.storage.local.get(prefs, callback);
      };

      player.on('timeupdate', () => {
        const {name} = player.currentSource();
        if (name) {
          cache[name] = player.currentTime();
        }
      });

      player.on('loadedmetadata', () => {
        const {name} = player.currentSource();
        if (name) {
          read({
            cache: {}
          }, prefs => {
            if (prefs.cache[name]) {
              player.currentTime(prefs.cache[name]);
              cache[name] = prefs.cache[name];
            }
            save();
          });
        }
      });
      window.addEventListener('beforeunload', save);

      player.on('ended', () => {
        const {name} = player.currentSource();
        if (name) {
          cache[name] = 0;
          save();
        }
      });
    }
  }
  videojs.registerPlugin('historyPlugin', HistoryPlugin);
}
