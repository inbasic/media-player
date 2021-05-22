/* globals videojs */
'use strict';

{
  const Plugin = videojs.getPlugin('plugin');

  class MousePlugin extends Plugin {
    constructor(player, options) {
      super(player, options);

      player.on('dblclick', e => {
        if (e.target.closest('.vjs-control-bar')) {
          return;
        }
        player[player.isFullscreen() ? 'exitFullscreen' : 'requestFullscreen']();
      });

      {
        let last = 0;
        document.body.addEventListener('mousewheel', e => {
          const now = Date.now();
          if (last + 200 < now && e.deltaX) {
            if (e.deltaX - e.deltaY > 1 || e.deltaX - e.deltaY < -1) {
              if (e.deltaY > 1 || e.deltaY < -1) {
                return;
              }
              last = now;
              player.seekProgress(e.deltaX > 0 ? 'forward' : 'backward');
            }
          }
        }, {passive: true});
      }
      {
        let last = 0;
        document.body.addEventListener('mousewheel', e => {
          if (e.target.localName !== 'video') {
            return;
          }
          const now = Date.now();
          if (last + 50 < now && e.deltaY) {
            if (e.deltaY - e.deltaX > 1 || e.deltaY - e.deltaX < -1) {
              if (e.deltaX > 1 || e.deltaX < -1) {
                return;
              }
              last = now;
              player.seekVolume(e);
            }
          }
        }, {passive: true});
      }
    }
  }
  videojs.registerPlugin('mousePlugin', MousePlugin);
}
