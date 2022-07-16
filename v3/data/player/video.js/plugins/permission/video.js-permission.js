/* global videojs, api */

{
  const permissions = /Firefox/.test(navigator.userAgent) ? ['activeTab'] : ['activeTab', 'scripting', 'declarativeNetRequestWithHostAccess'];
  const Button = videojs.getComponent('Button');
  class PermissionButton extends Button {
    handleClick() {
      chrome.permissions.request({
        origins: ['*://*/*'],
        permissions
      }).then(granted => {
        if (granted) {
          chrome.storage.local.set({
            'capture-media': true
          });
          this.player_.permissionButton.hide();
          api.toast('Please reopen to grab media from the current tab');
        }
      });
    }
    buildCSSClass() {
      return 'vjs-control vjs-button vjs-permission-button';
    }
    controlText(str, e) {
      e.title = str || 'Detect Media From Tab';
    }
  }
  Button.registerComponent('permissionButton', PermissionButton);

  const Plugin = videojs.getPlugin('plugin');
  class PermissionButtonPlugin extends Plugin {
    constructor(player, options) {
      super(player, options);

      chrome.permissions.contains({
        permissions,
        origins: ['*://*/*']
      }).then(granted => granted === false && player.ready(() => {
        const button = player.permissionButton = player.controlBar.addChild('permissionButton');

        player.controlBar.el().insertBefore(
          button.el(),
          player.controlBar.playbackRateMenuButton.el().nextSibling
        );
      }));
    }
  }
  videojs.registerPlugin('permissionButtonPlugin', PermissionButtonPlugin);
}
