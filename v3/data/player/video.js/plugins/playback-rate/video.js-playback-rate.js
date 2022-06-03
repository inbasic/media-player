/* globals videojs */
'use strict';

{
  const Plugin = videojs.getPlugin('plugin');

  class PlayBackRatePlugin extends Plugin {
    constructor(player, options) {
      super(player, options);

      let playrate;
      player.on('beforeplaylistitem', function() {
        playrate = player.playbackRate();
      });
      player.on('playlistitem', function() {
        player.playbackRate(playrate);
      });
    }
  }
  videojs.registerPlugin('playBackRatePlugin', PlayBackRatePlugin);
}
