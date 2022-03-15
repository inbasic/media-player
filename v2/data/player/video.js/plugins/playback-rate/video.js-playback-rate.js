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
        console.log(123, playrate);
        player.playbackRate(playrate);
      });
    }
  }
  videojs.registerPlugin('playBackRatePlugin', PlayBackRatePlugin);
}
