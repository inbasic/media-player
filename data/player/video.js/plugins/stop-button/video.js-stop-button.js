/* globals videojs */
'use strict';

{
  const Plugin = videojs.getPlugin('plugin');
  const Button = videojs.getComponent('Button');

  class StopButtonPlugin extends Plugin {
    constructor(player, options) {
      super(player, options);

      player.stop = () => window.location.reload();

      player.on('ready', () => {
        // Subclass the component (see 'extend' doc for more info)
        const StopButton = videojs.extend(Button, {
          handleClick: () => player.stop(),
          buildCSSClass: () => 'vjs-control vjs-button vjs-stop-button'
        });
        // Register the new component
        Button.registerComponent('stopButton', StopButton);
        // forward
        const forward = player.controlBar.addChild('stopButton');
        player.controlBar.el().insertBefore(
          forward.el(),
          player.controlBar.el().firstChild.nextSibling
        );
      });
    }
  }
  videojs.registerPlugin('stopButtonPlugin', StopButtonPlugin);
}
