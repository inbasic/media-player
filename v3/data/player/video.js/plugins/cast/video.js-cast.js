/* global videojs, Castjs */

document.head.appendChild = new Proxy(document.head.appendChild, {
  apply(target, self, args) {
    const [script] = args;

    if (script.src && script.src.includes('www.gstatic.com')) {
      if (script.src.includes('/clank/')) {
        script.src = 'video.js/plugins/cast/eureka/clank/102/cast_sender.js';
      }
      else {
        script.src = 'video.js/plugins/cast' + script.src.split('www.gstatic.com')[1];
      }
    }

    return Reflect.apply(target, self, args);
  }
});

{
  const Plugin = videojs.getPlugin('plugin');
  const Button = videojs.getComponent('Button');

  class CastButtonPlugin extends Plugin {
    constructor(player, options) {
      super(player, options);

      player.on('ready', () => {
        if (player.controlBar.castButton) {
          return;
        }

        // Subclass the component (see 'extend' doc for more info)
        const CastButton = videojs.extend(Button, {
          handleClick: () => {
            cjs.cast(player.src());
          },
          buildCSSClass: () => 'vjs-control vjs-button vjs-cast-button'
        });
        // Register the new component
        Button.registerComponent('castButton', CastButton);
        // forward
        const castButton = player.controlBar.castButton = player.controlBar.addChild('castButton');
        castButton.el().title = 'Cast Video';
        player.controlBar.el().insertBefore(
          castButton.el(),
          player.controlBar.chaptersButton.el()
        );
        castButton.hide();

        const cjs = new Castjs({});
        cjs.on('available', () => {
          castButton.show();
        });
      });
    }
  }
  videojs.registerPlugin('castButtonPlugin', CastButtonPlugin);
}
