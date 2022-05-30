/* global videojs, WaveSurfer */
'use strict';

{
  const Plugin = videojs.getPlugin('plugin');

  class WaveSurferPlugin extends Plugin {
    constructor(player, options) {
      super(player, options);

      const div = document.getElementById('wave-surfer');
      div.style = `
        position: fixed;
        left: 0;
        height: ${options.height}px;
        width: 100%;
        top: 50%;
        margin-top: -${options.height / 2}px;
        visibility: hidden;
        background-color: rgba(0, 0, 0, 0.1);
      `;
      let width = div.getBoundingClientRect().width;
      div.addEventListener('click', e => {
        if (player.readyState() === 0) {
          return;
        }
        player.currentTime(player.duration() * e.clientX / width);
      });
      player.ready(() => {
        player.el().insertBefore(div, player.controlBar.el());
      });

      let wavesurfer = {
        destroy() {},
        seekTo() {}
      };
      player.on('loadedmetadata', () => {
        div.textContent = '';
        const index = player.playlist.currentItem();
        if (index > -1) {
          const type = player.currentType();

          if (type && type.startsWith('audio/') || (player.videoWidth() === 0 && player.videoHeight() === 0)) {
            wavesurfer = WaveSurfer.create({
              container: div,
              waveColor: options.waveColor,
              progressColor: options.progressColor,
              height: options.height
            });
            wavesurfer.on('ready', () => {
              wavesurfer.seekTo(player.currentTime() / player.duration());
              div.style.visibility = 'visible';
            });
            wavesurfer.load(player.currentSrc());
          }
          else {
            wavesurfer.destroy();
          }
          div.style.visibility = 'hidden';
        }
      });
      player.on('timeupdate', () => {
        wavesurfer.seekTo(player.currentTime() / player.duration());
      });

      let id;
      window.addEventListener('resize', () => {
        clearTimeout(id);
        id = setTimeout(() => {
          try {
            wavesurfer.empty();
            wavesurfer.drawBuffer();
            wavesurfer.seekTo(player.currentTime() / player.duration());
            width = div.getBoundingClientRect().width;
          }
          catch (e) {}
        }, 100);
      });
    }
  }
  videojs.registerPlugin('waveSurferPlugin', WaveSurferPlugin);
}
