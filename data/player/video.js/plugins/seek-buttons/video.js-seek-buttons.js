/* globals videojs */
'use strict';

{
  const Plugin = videojs.getPlugin('plugin');
  const Button = videojs.getComponent('Button');

  class SeekButtonsPlugin extends Plugin {
    constructor(player, options) {
      super(player, options);

      player.seekProgress = (direction, index = 0) => {
        if (isNaN(player.duration()) === false) {
          const now = player.currentTime();
          let time = now + (direction === 'forward' ? +1 : -1) * options[direction][index];
          time = Math.min(player.duration(), time);
          time = Math.max(0, time);
          player.currentTime(time);
        }
      };

      player.on('ready', () => {
        // Subclass the component (see 'extend' doc for more info)
        const SeekButton = videojs.extend(Button, {
          handleClick: function() {
            player.seekProgress(this.options_.direction);
          },
          buildCSSClass: function() {
            return 'vjs-control vjs-button vjs-seek-button vjs-skip-' + this.options_.direction;
          }
        });
        // Register the new component
        Button.registerComponent('seekButton', SeekButton);
        // forward
        const forward = player.controlBar.addChild('seekButton', {
          direction: 'forward'
        });
        player.controlBar.el().insertBefore(
          forward.el(),
          player.controlBar.el().firstChild.nextSibling
        );
        // backward
        const backward = player.controlBar.addChild('seekButton', {
          direction: 'backward'
        });
        player.controlBar.el().insertBefore(
          backward.el(),
          player.controlBar.el().firstChild.nextSibling
        );
      });
    }
  }
  videojs.registerPlugin('seekButtonsPlugin', SeekButtonsPlugin);
}
