/* globals videojs, api, MediaMetadata */
'use strict';

{
  const Plugin = videojs.getPlugin('plugin');

  class KeyboardPlugin extends Plugin {
    constructor(player, options) {
      super(player, options);

      player.toggle = () => player[player.paused() ? 'play' : 'pause']();


      player.on('loadedmetadata', function() {
        try {
          navigator.mediaSession.metadata = new MediaMetadata({
            title: document.title
          });
          navigator.mediaSession.setActionHandler('nexttrack', api.player.playlist().length ? () => api.next() : null);
          navigator.mediaSession.setActionHandler('previoustrack', api.player.playlist().length ? () => api.previous() : null);
          navigator.mediaSession.setActionHandler('seekbackward', () => {
            player.seekProgress('backward', 0);
          });
          navigator.mediaSession.setActionHandler('seekforward', () => {
            player.seekProgress('forward', 0);
          });
        }
        catch (e) {}
      });

      document.body.addEventListener('keydown', ({code, shiftKey, ctrlKey, metaKey}) => {
        // console.log(code)
        switch (code) {
        case 'KeyO':
          api.remote.prompt();
          break;
        case 'Space':
          player.toggle();
          break;
        case 'KeyP':
          api.previous();
          break;
        case 'KeyR':
          if (ctrlKey === false && metaKey === false) {
            player.toggleLoop();
          }
          break;
        case 'KeyB':
          player.toggleBoost();
          break;
        case 'KeyN':
          api.next();
          break;
        case 'KeyS':
          player.snap();
          break;
        case 'KeyU':
          player.shuffle();
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
          api.toast(`Drop a video file to start or click on the "Play button"

Space: Toggle play/pause
O Key: Open a network URL
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
