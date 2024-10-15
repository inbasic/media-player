/* globals videojs, api */
'use strict';

{
  const Button = videojs.getComponent('Button');

  class LoopButton extends Button {
    handleClick(e) {
      e.preventDefault();
      e.stopPropagation();

      this.player_.toggleLoop();
    }
    buildCSSClass() {
      return 'vjs-control vjs-button vjs-loop-button';
    }
    controlText(str, e) {
      e.title = str || 'Loop (R)';
    }
  }
  Button.registerComponent('loopButton', LoopButton);

  const Plugin = videojs.getPlugin('plugin');
  class LoopButtonPlugin extends Plugin {
    constructor(player, options) {
      super(player, options);

      const one = e => {
        player.playlist.autoadvance(undefined);
        player.playlist.repeat(false);
        player.el().getElementsByTagName('video')[0].loop = true;
        e.classList.add('one', 'active');
        e.title = 'Loop (one track) (R)';
        localStorage.setItem('loop', 'one');
      };
      const on = e => {
        player.playlist.autoadvance(api.config.delay);
        player.playlist.repeat(true);
        player.el().getElementsByTagName('video')[0].loop = false;
        e.classList.add('active');
        e.title = 'Loop (on) (R)';
        localStorage.setItem('loop', 'true');
      };
      const off = e => {
        player.playlist.repeat(false);
        player.el().getElementsByTagName('video')[0].loop = false;
        player.playlist.autoadvance(api.config.delay);
        e.classList.remove('active', 'one');
        e.title = 'Loop (off) (R)';
        localStorage.setItem('loop', 'false');
      };

      player.toggleLoop = function() {
        const e = player.controlBar.loopButton.el();

        if (e.classList.contains('one')) {
          off(e);
        }
        else if (e.classList.contains('active')) {
          one(e);
        }
        else {
          on(e);
        }
      };

      // loop for one track does not work
      player.on('ended', () => {
        const e = player.controlBar.loopButton.el();
        if (player.playlist().length === 1 && e.classList.contains('active')) {
          setTimeout(() => {
            if (player.paused() && e.classList.contains('active')) {
              player.play();
            }
          }, api.config.delay * 1000);
        }
      });

      player.ready(() => {
        const loop = player.controlBar.loopButton = player.controlBar.addChild('loopButton');
        const video = player.el().getElementsByTagName('video')[0];

        // track changes
        const observer = new MutationObserver(function(mutationsList) {
          mutationsList.forEach(function(mutation) {
            if (mutation.attributeName === 'loop') {
              if (video.loop) {
                if (localStorage.getItem('loop') === 'true' || localStorage.getItem('loop') === 'false') {
                  localStorage.setItem('loop', 'one');
                  one(loop.el());
                }
              }
              if (video.loop === false) {
                if (localStorage.getItem('loop') === 'one') {
                  localStorage.setItem('loop', 'off');
                  off(loop.el());
                }
              }
            }
          });
        });
        observer.observe(video, {
          attributes: true
        });


        if (localStorage.getItem('loop') === 'false') {
          off(loop.el());
        }
        else if (localStorage.getItem('loop') === 'one') {
          one(loop.el());
        }
        else {
          on(loop.el());
        }

        player.controlBar.el().insertBefore(
          loop.el(),
          player.controlBar.volumePanel.el().nextSibling
        );
      });
    }
  }
  videojs.registerPlugin('loopButtonPlugin', LoopButtonPlugin);
}
