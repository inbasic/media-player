/* globals videojs */
'use strict';

{
  const Plugin = videojs.getPlugin('plugin');

  class PlayBackRatePlugin extends Plugin {
    #rate;

    constructor(player, options) {
      super(player, options);

      this.#rate = player.playbackRate();

      player.on('ratechange', () => {
        this.#rate = player.playbackRate();
      });

      player.on('playlistitem', () => {
        player.playbackRate(this.#rate);
      });

      player.on('ready', () => {
        // overwrite the default click handler over the rate button
        player.controlBar.playbackRateMenuButton.el().addEventListener('click', e => {
          if (e.target.type === 'button') {
            e.preventDefault();
            e.stopPropagation();

            this.change(e.shiftKey ? 'backward' : 'forward');
          }
        }, true);
      });
    }
    change(direction = 'forward') {
      const {player} = this;
      const rates = player.playbackRates();
      const index = rates.indexOf(this.#rate);

      // this get the previous  rate and it will select the last one first one if the first one currently selected
      if (index !== -1) {
        const newIndex = (index + rates.length + (direction === 'forward' ? 1 : -1)) % rates.length;
        this.#rate = rates[newIndex];

        player.playbackRate(this.#rate);
      }
    }
  }

  videojs.registerPlugin('playBackRatePlugin', PlayBackRatePlugin);
}
