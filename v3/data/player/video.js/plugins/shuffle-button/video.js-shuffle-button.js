/* globals videojs, api */
'use strict';

{
  const Button = videojs.getComponent('Button');
  class ShuffleButton extends Button {
    handleClick() {
      this.player_.shuffle();
    }
    buildCSSClass() {
      return 'vjs-control vjs-button vjs-shuffle-button';
    }
    controlText(str, e) {
      e.title = str || 'Shuffle (U)';
    }
  }
  Button.registerComponent('shuffleButton', ShuffleButton);

  const Plugin = videojs.getPlugin('plugin');
  class ShuffleButtonPlugin extends Plugin {
    constructor(player, options) {
      super(player, options);

      player.shuffle = function() {
        player.playlist.shuffle(true);
        api.next();
      };

      player.ready(() => {
        const shuffleButton = player.controlBar.shuffleButton = player.controlBar.addChild('shuffleButton');
        player.controlBar.el().insertBefore(
          shuffleButton.el(),
          player.controlBar.volumePanel.el().nextSibling
        );
      });
    }
  }
  videojs.registerPlugin('shuffleButtonPlugin', ShuffleButtonPlugin);
}
