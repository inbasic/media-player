/* global videojs, api */

{
  const Button = videojs.getComponent('Button');
  class PermissionButton extends Button {
    handleClick() {
      chrome.permissions.request({
        permissions: ['activeTab', 'scripting', 'declarativeNetRequestWithHostAccess'],
        origins: ['*://*/*']
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
        permissions: ['activeTab', 'scripting', 'declarativeNetRequestWithHostAccess'],
        origins: ['*://*/*']
      }).then(granted => granted === false && player.ready(() => {
        const button = player.permissionButton = player.controlBar.addChild('permissionButton');

        player.controlBar.el().insertBefore(
          button.el(),
          player.controlBar.volumePanel.el()
        );
      }));
    }
  }
  videojs.registerPlugin('permissionButtonPlugin', PermissionButtonPlugin);
}
