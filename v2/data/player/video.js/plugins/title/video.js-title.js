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
          let name = item.name;
          if (!name && item.sources) {
            name = item.sources[0].name;
          }
          const stat = (index + 1) + '/' + playlist.length;
          document.title = `[${stat}] ${name} - ${api.config.name}`;
          document.body.dataset.type = item.type;
          // toast
          api.toast(name);
        }
        else {
          document.title = api.config.name;
          delete document.body.dataset.type;
        }
      });
    }
  }
  videojs.registerPlugin('titlePlugin', TitlePlugin);
}
