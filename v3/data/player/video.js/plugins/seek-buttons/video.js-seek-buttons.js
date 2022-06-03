/* globals videojs, api */
'use strict';

{
  const Button = videojs.getComponent('Button');
  class SeekButton extends Button {
    handleClick() {
      this.player_.seekProgress(this.options_.direction);
    }
    buildCSSClass() {
      return 'vjs-control vjs-button vjs-seek-button vjs-skip-' + this.options_.direction;
    }
    controlText(str, e) {
      e.title = str || this.options_.text;
    }
  }
  Button.registerComponent('seekButton', SeekButton);

  const Plugin = videojs.getPlugin('plugin');
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
        else {
          api.toast('Cannot seek ' + direction);
        }
      };

      player.ready(() => {
        const forward = player.controlBar.forward = player.controlBar.addChild('seekButton', {
          direction: 'forward',
          text: 'Step Forward (→)'
        });
        player.controlBar.el().insertBefore(
          forward.el(),
          player.controlBar.playToggle.el().nextSibling
        );
        // backward
        const backward = player.controlBar.backward = player.controlBar.addChild('seekButton', {
          direction: 'backward',
          text: 'Step Backward (←)'
        });
        player.controlBar.el().insertBefore(
          backward.el(),
          player.controlBar.playToggle.el()
        );
      });
    }
  }
  videojs.registerPlugin('seekButtonsPlugin', SeekButtonsPlugin);
}
