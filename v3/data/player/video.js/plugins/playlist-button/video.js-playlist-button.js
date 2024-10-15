/* global videojs */
'use strict';

{
  const Plugin = videojs.getPlugin('plugin');
  const Button = videojs.getComponent('Button');

  class PlaylistButtonPlugin extends Plugin {
    constructor(player, options) {
      super(player, options);

      player.on('ready', () => {
        if (player.controlBar.playlistButton) {
          return;
        }

        class PlaylistButton extends Button {
          handleClick() {
            player.playlistMenu.toggleClass('vjs-hidden');
          }
          buildCSSClass() {
            return 'vjs-control vjs-button vjs-playlist-button vjs-hidden';
          }
          controlText(str, e) {
            e.title = str || 'Playlist (P: Previous Track; N: Next Track)';
          }
        }

        // Register the new component
        Button.registerComponent('playlistButton', PlaylistButton);
        // playlist
        const playlist = player.controlBar.playlistButton = player.controlBar.addChild('playlistButton');
        player.controlBar.el().insertBefore(
          playlist.el(),
          player.controlBar.el().lastChild.previousSibling
        );
        player.on('playlistchange', () => {
          const length = player.playlist().length;
          playlist[length > 1 ? 'show' : 'hide']();
        });
        playlist.el().appendChild(player.playlistMenu.el());
        document.addEventListener('click', e => {
          const target = e.target;
          e.preventDefault();
          e.stopImmediatePropagation();
          if (!playlist.el().contains(target)) {
            player.playlistMenu.addClass('vjs-hidden');
          }
        });
      });
    }
  }
  videojs.registerPlugin('playlistButtonPlugin', PlaylistButtonPlugin);
}
