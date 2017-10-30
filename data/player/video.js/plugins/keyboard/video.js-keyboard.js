/* globals videojs, api */
'use strict';

{
  const Plugin = videojs.getPlugin('plugin');

  class KeyboardPlugin extends Plugin {
    constructor(player, options) {
      super(player, options);

      player.toggle = () => player[player.paused() ? 'play' : 'pause']();

      document.body.addEventListener('keydown', ({code, shiftKey}) => {
        // console.log(code)
        switch (code) {
          case 'Space':
            player.toggle();
            break;
          case 'KeyP':
            api.previous();
            break;
          case 'KeyN':
            api.next();
            break;
          case 'KeyF':
            player[player.isFullscreen() ? 'exitFullscreen' : 'requestFullscreen']();
            break;
          case 'ArrowRight':
          case 'ArrowLeft':
            player.seekProgress(code === 'ArrowRight' ? 'forward' : 'backward', shiftKey ? 1 : 0);
            break;
          case 'ArrowUp':
          case 'ArrowDown': {
            player.seekVolume({
              deltaY: code === 'ArrowUp' ? -4 : 4
            });
            break;
          }
        }
      });

      player.on('ready', () => {
        if (!('src' in api.arguments)) {
          api.toast(`Drop a video file to start

Space: Toggle play/pause
F Key: Toggle fullscreen
N Key: Next track
P Key: Previous track
← Key: Seek -10 seconds
→ Key: Seek +10 seconds
↑ Key: Volume up
↓ Key: Volume down`, {
  timeout: 10,
  style: `
    bottom: 80px;
    right: 30px;
    top: auto;
    font-size: 100%;
    margin: auto;
  `
});
        }
      });
    }
  }
  videojs.registerPlugin('keyboardPlugin', KeyboardPlugin);
}
