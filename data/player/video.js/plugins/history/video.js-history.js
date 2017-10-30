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

      player.on('timeupdate', () => {
        const name = api.player.cache_.source.name;
        if (name) {
          cache[name] = player.currentTime();
        }
      });
      const save = () => {
        if (api.background) {
          api.background.save({cache});
        }
      };
      player.on('loadedmetadata', () => {
        const name = api.player.cache_.source.name;
        if (name && chrome.storage) {
          chrome.storage.local.get({
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
        const name = api.player.cache_.source.name;
        if (name) {
          cache[name] = 0;
          save();
        }
        api.next();
      });
    }
  }
  videojs.registerPlugin('historyPlugin', HistoryPlugin);
}
