/* globals videojs */
'use strict';

{
  const Plugin = videojs.getPlugin('plugin');
  const Button = videojs.getComponent('Button');

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

      player.on('ready', () => {
        // Subclass the component (see 'extend' doc for more info)
        const StopButton = videojs.extend(Button, {
          handleClick: () => player.stop(),
          buildCSSClass: () => 'vjs-control vjs-button vjs-stop-button'
        });
        // Register the new component
        Button.registerComponent('stopButton', StopButton);
        // forward
        const stopButton = player.controlBar.stopButton = player.controlBar.addChild('stopButton');
        player.controlBar.el().insertBefore(
          stopButton.el(),
          player.controlBar.el().firstChild.nextSibling
        );
      });
    }
  }
  videojs.registerPlugin('stopButtonPlugin', StopButtonPlugin);
}
