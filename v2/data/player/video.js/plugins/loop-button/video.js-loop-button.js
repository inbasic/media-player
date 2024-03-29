/* globals videojs, api */
'use strict';

{
  const Plugin = videojs.getPlugin('plugin');
  const Button = videojs.getComponent('Button');

  class LoopButtonPlugin extends Plugin {
    constructor(player, options) {
      super(player, options);

      player.on('ready', () => {
        if (player.controlBar.loopButton) {
          return;
        }

        const one = e => {
          player.playlist.autoadvance(undefined);
          player.playlist.repeat(false);
          e.classList.add('one', 'active');
          e.title = 'Loop (one track) (R)';
          localStorage.setItem('loop', 'one');
        };
        const on = e => {
          player.playlist.autoadvance(api.config.delay);
          player.playlist.repeat(true);
          e.classList.add('active');
          e.title = 'Loop (on) (R)';
          localStorage.setItem('loop', 'true');
        };
        const off = e => {
          player.playlist.repeat(false);
          player.playlist.autoadvance(api.config.delay);
          e.classList.remove('active', 'one');
          e.title = 'Loop (off) (R)';
          localStorage.setItem('loop', 'false');
        };

        player.toggleLoop = function() {
          const e = loop.el();

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

        // Subclass the component (see 'extend' doc for more info)
        const LoopButton = videojs.extend(Button, {
          handleClick: ev => {
            ev.preventDefault();
            ev.stopPropagation();
            player.toggleLoop();
          },
          buildCSSClass: () => 'vjs-control vjs-button vjs-loop-button',
          text: 'Loop'
        });

        player.on('ended', () => {
          setTimeout(() => {
            if (player.paused() && loop.el().classList.contains('one')) {
              player.play();
            }
          }, api.config.delay * 1000);
        });

        // Register the new component
        Button.registerComponent('loopButton', LoopButton);
        // loop
        const loop = player.controlBar.loopButton = player.controlBar.addChild('loopButton');
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
          player.controlBar.stopButton.el().nextSibling
        );
      });
    }
  }
  videojs.registerPlugin('loopButtonPlugin', LoopButtonPlugin);
}
