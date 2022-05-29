/* global videojs, Castjs */

document.head.appendChild = new Proxy(document.head.appendChild, {
  apply(target, self, args) {
    const [script] = args;
    if (script.src === 'https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1') {
      script.src = 'video.js/plugins/cast/cast_sender.js?loadCastFramework=1';
    }
    if (script.src && script.src.endsWith('www.gstatic.com/eureka/clank/cast_sender.js')) {
      script.src = 'video.js/plugins/cast/eureka/clank/cast_sender.js';
    }
    if (script.src && script.src.endsWith('www.gstatic.com/eureka/clank/101/cast_sender.js')) {
      script.src = 'video.js/plugins/cast/eureka/clank/101/cast_sender.js';
    }
    if (script.src && script.src.endsWith('www.gstatic.com/eureka/clank/102/cast_sender.js')) {
      script.src = 'video.js/plugins/cast/eureka/clank/102/cast_sender.js';
    }
    if (script.src && script.src.endsWith('www.gstatic.com/cast/sdk/libs/sender/1.0/cast_framework.js')) {
      script.src = 'video.js/plugins/cast/sdk/libs/sender/1.0/cast_framework.js';
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
