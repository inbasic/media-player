/* global videojs */

{
  const MenuButton = videojs.getComponent('MenuButton');
  const MenuItem = videojs.getComponent('MenuItem');

  class QualityMenuItem extends MenuItem {
    handleClick() {
      const player = this.player();
      const options = this.options_;

      player.controlBar.qualityButton.quality(options.value, true);
    }
  }

  class QualityMenuButton extends MenuButton {
    constructor(player, options) {
      super(player, options);
    }
    buildCSSClass() {
      return 'vjs-control vjs-hls-quality-selector';
    }
    createItems() {
      return [];
    }
    clean() {
      while (true) {
        const items = this.menu.children();
        if (items.length) {
          this.menu.removeChild(items[0]);
        }
        else {
          break;
        }
      }
    }
    add(value, selected = false) {
      if (value.height) {
        const player = this.player();
        const label = value.height ? (value.height + 'p') : 'NA';

        const item = new QualityMenuItem(player, {
          label,
          value,
          selectable: true,
          selected
        });
        this.menu.addChild(item);
      }
      else {
        console.warn('Quality Dropped', value);
      }
    }
    quality(v, change = false) {
      for (const item of this.menu.children()) {
        item.selected(item.options_.value === v);
      }
      if (change) {
        const player = this.player();
        const levels = player.qualityLevels().levels_;
        for (const level of levels) {
          level.enabled = v === level;
        }
      }
    }
  }
  MenuButton.registerComponent('qualityMenuButton', QualityMenuButton);

  const Plugin = videojs.getPlugin('plugin');
  class HlsQualitySelectorPlugin extends Plugin {
    constructor(player, options) {
      super(player, options);


      player.ready(() => {
        const qualityButton = player.controlBar.qualityButton = player.controlBar.addChild('qualityMenuButton');
        const qualityLevels = player.qualityLevels();

        player.on('loadedmetadata', () => {
          qualityButton.clean();
          if (qualityLevels.length) {
            for (let i = 0; i < qualityLevels.length; i++) {
              const qualityLevel = qualityLevels[i];

              qualityButton.add(qualityLevel, qualityLevels.selectedIndex === i);
            }
            qualityButton.show();
          }
          else {
            qualityButton.hide();
          }
        });

        player.controlBar.el().insertBefore(
          qualityButton.el(),
          player.controlBar.fullscreenToggle.el()
        );

        qualityLevels.on('change', e => {
          qualityButton.quality(qualityLevels[e.selectedIndex], false);
        });
      });
    }
  }
  videojs.registerPlugin('hlsQualitySelectorPlugin', HlsQualitySelectorPlugin);
}
