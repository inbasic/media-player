/* globals videojs */
'use strict';

{
  const Button = videojs.getComponent('Button');
  class StopButton extends Button {
    handleClick() {
      this.player_.stop();
    }
    buildCSSClass() {
      return 'vjs-control vjs-button vjs-stop-button';
    }
    controlText(str, e) {
      e.title = str || 'Stop';
    }
  }
  Button.registerComponent('stopButton', StopButton);

  const Plugin = videojs.getPlugin('plugin');
  class StopButtonPlugin extends Plugin {
    constructor(player, options) {
      super(player, options);

      player.stop = () => {
        // player.pause();
        // player.currentTime(0);
        // player.controlBar.hide();
        // player.bigPlayButton.show();
        // player.posterImage.show();
        // player.poster('poster/1920x1200.jpg');
        // player.hasStarted(false);
        // player.playlist([]);
        // player.trigger('loadstart');
        location.replace(location.href.split('?')[0]);
      };

      player.ready(() => {
        const stopButton = player.controlBar.stopButton = player.controlBar.addChild('stopButton');
        player.controlBar.el().insertBefore(
          stopButton.el(),
          player.controlBar.volumePanel.el()
        );
      });
    }
  }
  videojs.registerPlugin('stopButtonPlugin', StopButtonPlugin);
}
