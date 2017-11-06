/* globals videojs, WaveSurfer */
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
        opacity: 0;
        background-color: rgba(0, 0, 0, 0.1);
      `;
      let width = div.getBoundingClientRect().width;
      const wavesurfer = WaveSurfer.create({
        container: div,
        waveColor: options.waveColor,
        progressColor: options.progressColor,
        height: options.height
      });
      wavesurfer.on('ready', () => {
        wavesurfer.seekTo(player.currentTime() / player.duration());
        div.style.opacity = '1';
      });
      div.addEventListener('click', e => {
        player.currentTime(player.duration() * e.clientX / width);
      });
      player.on('ready', () => {
        player.el().insertBefore(div, player.controlBar.el());
      });
      player.on('loadedmetadata', () => {
        const index = player.playlist.currentItem();
        if (index > -1) {
          const src = player.playlist()[index].sources[0];
          // only load for audio
          if (src.type.startsWith('audio/')) {
            wavesurfer.load(src.src);
          }
          else {
            wavesurfer.empty();
          }
          div.style.opacity = '0';
        }
      });
      player.on('timeupdate', () => {
        wavesurfer.seekTo(player.currentTime() / player.duration());
      });
      window.addEventListener('resize', () => {
        wavesurfer.empty();
        wavesurfer.drawBuffer();
        wavesurfer.seekTo(player.currentTime() / player.duration());
        width = div.getBoundingClientRect().width;
      });
    }
  }
  videojs.registerPlugin('waveSurferPlugin', WaveSurferPlugin);
}
