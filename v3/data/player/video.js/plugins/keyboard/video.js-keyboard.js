/* globals videojs, api, MediaMetadata */
'use strict';

{
  const Plugin = videojs.getPlugin('plugin');
  navigator.mediaSession.metadata = navigator.mediaSession.metadata || new MediaMetadata({});

  class KeyboardPlugin extends Plugin {
    constructor(player, options) {
      super(player, options);

      player.toggle = () => player[player.paused() ? 'play' : 'pause']();

      player.on('loadeddata', function(e) {
        const player = e.target.player;
        const playlist = player.playlist();
        const index = player.playlist.currentItem();

        const nexttrack = (playlist.length && index !== playlist.length - 1) ? () => api.next() : null;
        const previoustrack = (playlist.length && index !== 0) ? () => api.previous() : null;

        navigator.mediaSession.metadata.title = document.title;
        navigator.mediaSession.setActionHandler('nexttrack', nexttrack);
        navigator.mediaSession.setActionHandler('previoustrack', previoustrack);
        navigator.mediaSession.setActionHandler('seekbackward', () => {
          player.seekProgress('backward', 0);
        });
        navigator.mediaSession.setActionHandler('seekforward', () => {
          player.seekProgress('forward', 0);
        });
      });

      document.body.addEventListener('keydown', ({code, shiftKey, ctrlKey, metaKey}) => {
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
            try {
              player.toggleLoop();
            }
            catch (e) {
              api.toast('Loop Plugin Failed');
            }
          }
          break;
        case 'KeyB':
          try {
            player.toggleBoost();
          }
          catch (e) {
            api.toast('Boost Plugin Failed');
          }
          break;
        case 'KeyC':
          try {
            api.player.controlBar.castButton.trigger('click');
          }
          catch (e) {
            api.toast('Cast Plugin Failed');
          }
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
            timeout: 1200,
            style: `
              bottom: 10px;
              right: 10px;
              top: auto;
              font-size: 12px;
              margin: auto;
            `
          });
        }
      });
    }
  }
  videojs.registerPlugin('keyboardPlugin', KeyboardPlugin);
}
