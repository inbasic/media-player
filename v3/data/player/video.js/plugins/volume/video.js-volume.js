/* globals videojs, api */
'use strict';

{
  const Plugin = videojs.getPlugin('plugin');

  class TrackVolumePlugin extends Plugin {
    constructor(player, options) {
      super(player, options);

      player.one('volumechange', () => {
        // Trigger only after the initial set
        player.on('volumechange', () => {
          const volume = player.volume();
          window.localStorage.setItem('video-volume', volume);
          api.toast('Volume ' + (volume * 100).toFixed(0) + '%');
        });
      });

      player.on('ready', () => {
        const volume = window.localStorage.getItem('video-volume') || '0.8';
        player.volume(Number(volume));
      });
      player.seekVolume = ({deltaY}) => {
        let steps = deltaY / 4;
        steps = Math.min(steps, 2);
        steps = Math.max(steps, -2);
        const volume = player.volume() - steps * 0.01;
        player.volume(Math.min(Math.max(volume, 0), 1));
      };
    }
  }
  videojs.registerPlugin('trackVolumePlugin', TrackVolumePlugin);
}
