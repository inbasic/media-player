/* globals videojs */
'use strict';

{
  const Button = videojs.getComponent('Button');
  class BoostButton extends Button {
    handleClick(e) {
      this.player_.toggleBoost();
    }
    buildCSSClass() {
      return 'vjs-control vjs-button vjs-boost-button';
    }
    controlText(str, e) {
      e.title = str || 'Boost Volume (B)';
    }
  }
  // Register the new component
  Button.registerComponent('boostButton', BoostButton);

  const Plugin = videojs.getPlugin('plugin');
  class BoostButtonPlugin extends Plugin {
    constructor(player, options) {
      super(player, options);

      let context;
      let gain;

      player.boost = function(value = 2) {
        if (context === undefined) {
          context = new(window.AudioContext);
          gain = context.createGain();

          const video = player.el().querySelector('video');
          const source = context.createMediaElementSource(video);
          source.connect(gain);
          gain.connect(context.destination);
        }
        gain.gain.value = value;
      };

      player.toggleBoost = function() {
        const boostButton = player.controlBar.boostButton;

        if (boostButton.hasClass('active')) {
          boostButton.removeClass('active');
          player.boost(1);
        }
        else {
          boostButton.addClass('active');
          player.boost(2);
        }
      };

      player.on('volumechange', () => {
        const boostButton = player.controlBar.boostButton;
        if (boostButton) {
          boostButton[player.volume() >= 0.8 ? 'show' : 'hide']();
        }
      });

      player.ready(() => {
        const boostButton = player.controlBar.boostButton = player.controlBar.addChild('boostButton');
        player.controlBar.el().insertBefore(
          boostButton.el(),
          player.controlBar.chaptersButton.el()
        );
        if (player.volume() < 0.8) {
          boostButton.hide();
        }
      });
    }
  }
  videojs.registerPlugin('boostButtonPlugin', BoostButtonPlugin);
}
