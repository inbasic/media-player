/* globals videojs, api */
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

      const save = () => {
        if (api.background) {
          api.background.save({cache});
        }
        else {
          save.dummy.cache = Object.assign({}, cache);
        }
      };
      save.dummy = {
        cache: {}
      };
      const read = (prefs, callback) => {
        if (chrome.storage) {
          chrome.storage.local.get(prefs, callback);
        }
        else {
          callback(save.dummy);
        }
      };

      player.on('timeupdate', () => {
        const index = player.playlist.currentItem();
        if (index > -1) {
          const name = player.playlist()[index].name;
          if (name) {
            cache[name] = player.currentTime();
          }
        }
      });

      player.on('loadedmetadata', () => {
        const index = player.playlist.currentItem();
        if (index > -1) {
          const name = player.playlist()[index].name;
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
        }
      });
      window.addEventListener('beforeunload', save);

      player.on('ended', () => {
        const index = player.playlist.currentItem();
        if (index > -1) {
          const name = player.playlist()[index].name;
          if (name) {
            cache[name] = 0;
            save();
          }
        }
      });
    }
  }
  videojs.registerPlugin('historyPlugin', HistoryPlugin);
}
