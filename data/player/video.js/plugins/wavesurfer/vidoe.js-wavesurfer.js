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
      player.on('ready', () => {
        player.el().insertBefore(div, player.controlBar.el());
      });

      let wavesurfer = {
        destroy() {},
        seekTo() {}
      };
      player.on('loadedmetadata', () => {
        const index = player.playlist.currentItem();
        if (index > -1) {
          const src = player.playlist()[index].sources[0];
          // console.log(src);
          // only load for audio
          const video = player.el().querySelector('video');
          if (src.type.startsWith('audio/') || (video.videoWidth === 0 && video.videoHeight === 0)) {
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
            wavesurfer.load(src.src);
          }
          else {
            wavesurfer.destroy();
            console.log('done');
          }
          div.style.visibility = 'hidden';
        }
      });
      player.on('timeupdate', () => {
        wavesurfer.seekTo(player.currentTime() / player.duration());
      });
      window.addEventListener('resize', () => {
        try {
          wavesurfer.empty();
          wavesurfer.drawBuffer();
          wavesurfer.seekTo(player.currentTime() / player.duration());
          width = div.getBoundingClientRect().width;
        }
        catch (e) {}
      });
    }
  }
  videojs.registerPlugin('waveSurferPlugin', WaveSurferPlugin);
}
