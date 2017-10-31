/* globals videojs, api */
'use strict';

{
  const Plugin = videojs.getPlugin('plugin');

  class TitlePlugin extends Plugin {
    constructor(player, options) {
      super(player, options);

      player.on('loadstart', () => {
        const index = player.playlist.currentItem();
        if (index > -1) {
          const playlist = player.playlist();
          const item = playlist[index];
          const name = item.name;
          const stat = (index + 1) + '/' + playlist.length;
          document.title = `[${stat}] ${name} - ${api.config.name}`;
          api.toast(name);
        }
      });
    }
  }
  videojs.registerPlugin('titlePlugin', TitlePlugin);
}
