/* globals videojs */
'use strict';

{
  const Plugin = videojs.getPlugin('plugin');

  class SmartInactivePlugin extends Plugin {
    constructor(player, options) {
      super(player, options);

      player.on('loadedmetadata', () => {
        const index = player.playlist.currentItem();
        if (index > -1) {
          const type = player.playlist()[index].type || '';
          const video = player.el().querySelector('video');
          const audio = type.startsWith('audio/') || (video.videoWidth === 0 && video.videoHeight === 0);

          player.options_.inactivityTimeout = audio ? null : options.inactivityTimeout;
          player.userActive(true);
        }
      });
    }
  }
  videojs.registerPlugin('smartInactivePlugin', SmartInactivePlugin);
}
