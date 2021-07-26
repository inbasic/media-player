/* globals videojs */
'use strict';

{
  const Plugin = videojs.getPlugin('plugin');
  const Button = videojs.getComponent('Button');

  class ScreenshotButtonPlugin extends Plugin {
    constructor(player, options) {
      super(player, options);

      player.snap = function() {
        player.pause();
        player.el().blur();
        player.controlBar.hide();

        const video = player.el().querySelector('video');
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0);

        const a = document.createElement('a');
        a.href = canvas.toDataURL();
        a.download = 'screenshot.png';
        a.click();

        player.controlBar.show();
        player.el().focus();
      };

      player.on('ready', () => {
        if (player.controlBar.screenshotButton) {
          return;
        }

        // Subclass the component (see 'extend' doc for more info)
        const ScreenshotButton = videojs.extend(Button, {
          handleClick: () => {
            player.snap();
          },
          buildCSSClass: () => 'vjs-control vjs-button vjs-screenshot-button'
        });
        // Register the new component
        Button.registerComponent('screenshotButton', ScreenshotButton);
        // forward
        const screenshotButton = player.controlBar.screenshotButton = player.controlBar.addChild('screenshotButton');
        screenshotButton.el().title = 'Take a screenshot (S)';
        player.controlBar.el().insertBefore(
          screenshotButton.el(),
          player.controlBar.chaptersButton.el()
        );

        // hide on audio
        player.on('loadedmetadata', () => {
          const index = player.playlist.currentItem();
          if (index > -1) {
            const video = player.el().querySelector('video');
            const src = player.playlist()[index].sources[0];
            const audio = src.type && src.type.startsWith('audio/') || (video.videoWidth === 0 && video.videoHeight === 0);
            if (audio) {
              screenshotButton.hide();
            }
            else {
              screenshotButton.show();
            }
          }
        });
      });
    }
  }
  videojs.registerPlugin('screenshotButtonPlugin', ScreenshotButtonPlugin);
}
