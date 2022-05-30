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
  const Button = videojs.getComponent('Button');
  class CastButton extends Button {
    handleClick() {
      this.cjs.cast(this.player_.src());
    }
    buildCSSClass() {
      return 'vjs-control vjs-button vjs-cast-button';
    }
    controlText(str, e) {
      e.title = str || 'Cast Video';
    }
  }
  Button.registerComponent('castButton', CastButton);

  const Plugin = videojs.getPlugin('plugin');
  class CastButtonPlugin extends Plugin {
    constructor(player, options) {
      super(player, options);

      player.ready(() => {
        const castButton = player.controlBar.castButton = player.controlBar.addChild('castButton');
        player.controlBar.el().insertBefore(
          castButton.el(),
          player.controlBar.fullscreenToggle.el()
        );
        castButton.hide();

        castButton.cjs = new Castjs({});
        castButton.cjs.on('available', () => {
          castButton.show();
        });
      });
    }
  }
  videojs.registerPlugin('castButtonPlugin', CastButtonPlugin);
}
