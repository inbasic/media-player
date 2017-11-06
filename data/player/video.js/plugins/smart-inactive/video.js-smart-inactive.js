/* globals videojs */
'use strict';

{
  const Plugin = videojs.getPlugin('plugin');

  class SmartInactivePlugin extends Plugin {
    constructor(player, options) {
      super(player, options);

      player.on('loadstart', () => {
        const index = player.playlist.currentItem();
        if (index > -1) {
          const type = player.playlist()[index].type;
          player.options_.inactivityTimeout = type.startsWith('audio/') ? null : options.inactivityTimeout;
          player.userActive(true);
        }
      });
    }
  }
  videojs.registerPlugin('smartInactivePlugin', SmartInactivePlugin);
}
