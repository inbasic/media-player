/* globals videojs */
'use strict';

{
  const Button = videojs.getComponent('Button');
  class ScreenshotButton extends Button {
    handleClick() {
      this.player_.snap();
    }
    buildCSSClass() {
      return 'vjs-control vjs-button vjs-screenshot-button';
    }
    controlText(str, e) {
      e.title = str || 'Take a screenshot (S)';
    }
  }
  Button.registerComponent('screenshotButton', ScreenshotButton);

  const Plugin = videojs.getPlugin('plugin');
  class ScreenshotButtonPlugin extends Plugin {
    constructor(player, options) {
      super(player, options);

      player.snap = function() {
        player.pause();
        player.el().blur();
        player.controlBar.hide();

        try {
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
        }
        catch (e) {
          console.warn(e);
          alert(e.message);
        }

        player.controlBar.show();
        player.el().focus();
      };

      player.ready(() => {
        const screenshotButton = player.controlBar.screenshotButton = player.controlBar.addChild('screenshotButton');
        player.controlBar.el().insertBefore(
          screenshotButton.el(),
          player.controlBar.chaptersButton.el()
        );

        // hide on audio
        player.on('loadedmetadata', () => {
          const index = player.playlist.currentItem();
          if (index > -1) {
            const type = player.currentType();

            const audio = (type && type.startsWith('audio/')) || (player.videoWidth() === 0 && player.videoHeight() === 0);
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
