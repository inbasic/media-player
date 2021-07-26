/* globals videojs */
'use strict';

{
  const Plugin = videojs.getPlugin('plugin');
  const Button = videojs.getComponent('Button');

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

      player.on('ready', () => {
        if (player.controlBar.boostButton) {
          return;
        }
        player.toggleBoost = function() {
          if (boostButton.hasClass('active')) {
            boostButton.removeClass('active');
            player.boost(1);
          }
          else {
            boostButton.addClass('active');
            player.boost(2);
          }
        };

        const BoostButton = videojs.extend(Button, {
          handleClick: () => {
            player.toggleBoost();
          },
          buildCSSClass: () => 'vjs-control vjs-button vjs-boost-button'
        });
        // Register the new component
        Button.registerComponent('boostButton', BoostButton);
        // forward
        const boostButton = player.controlBar.boostButton = player.controlBar.addChild('boostButton');
        boostButton.el().title = 'Boost Volume (B)';
        player.controlBar.el().insertBefore(
          boostButton.el(),
          player.controlBar.chaptersButton.el()
        );
        if (player.volume() < 0.8) {
          boostButton.hide();
        }
        player.on('volumechange', () => {
          boostButton[player.volume() >= 0.8 ? 'show' : 'hide']();
        });
      });
    }
  }
  videojs.registerPlugin('boostButtonPlugin', BoostButtonPlugin);
}
