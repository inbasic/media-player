/* globals videojs */
'use strict';

{
  const Plugin = videojs.getPlugin('plugin');

  class PlaylistMenuExtraPlugin extends Plugin {
    constructor(player, options) {
      super(player, options);
      player.on('loadedmetadata', () => {
        const index = player.playlist.currentItem();
        if (index !== -1) {
          const item = player.playlist()[index];
          if (item.duration === '--') {
            item.duration = player.duration();
            player.playlistMenu.items[index].el().querySelector('time').textContent = videojs.formatTime(item.duration);
          }
        }
      });
    }
  }
  videojs.registerPlugin('playlistMenuExtraPlugin', PlaylistMenuExtraPlugin);
}
