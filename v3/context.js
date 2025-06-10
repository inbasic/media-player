/* global FORMATS, onCommand, notify */

const isFF = /Firefox/.test(navigator.userAgent);

// context-menu
{
  const once = () => {
    if (once.done) {
      return;
    }
    once.done = true;

    chrome.contextMenus.create({
      id: 'open-src',
      title: 'Open in Media Player',
      contexts: ['video', 'audio'],
      documentUrlPatterns: ['*://*/*'],
      targetUrlPatterns: ['*://*/*']
    });
    chrome.contextMenus.create({
      title: 'Play with Media Player',
      id: 'play-link',
      contexts: ['link'],
      targetUrlPatterns: FORMATS.map(a => ['*://*/*.' + a, '*://*/*.' + a + '*']).flat(),
      documentUrlPatterns: ['*://*/*']
    });
    chrome.contextMenus.create({
      id: 'navigation',
      title: 'Navigation',
      contexts: ['action']
    });
    chrome.contextMenus.create({
      id: 'previous-track',
      title: 'Previous Track',
      contexts: ['action'],
      parentId: 'navigation'
    });
    chrome.contextMenus.create({
      id: 'next-track',
      title: 'Next Track',
      contexts: ['action'],
      parentId: 'navigation'
    });
    chrome.contextMenus.create({
      id: 'toggle-play',
      title: 'Toggle Play/Pause',
      contexts: ['action'],
      parentId: 'navigation'
    });
    chrome.contextMenus.create({
      id: 'test-audio',
      title: 'Test Playback',
      contexts: ['action']
    });
    chrome.contextMenus.create({
      id: 'options',
      title: 'Options',
      contexts: ['action']
    });
    chrome.contextMenus.create({
      id: 'user-styling',
      title: 'Open User Style Editor',
      contexts: ['action'],
      parentId: 'options'
    });
    chrome.contextMenus.create({
      id: 'plugins',
      title: 'Player Plugins',
      contexts: ['action']
    });
    chrome.storage.local.get({
      'open-in-tab': false,
      'capture-media': false,
      'screenshot-plugin': isFF ? false : true,
      'boost-plugin': isFF ? false : true,
      'loop-plugin': true,
      'shuffle-plugin': true,
      'stop-plugin': true,
      'permission-plugin': true,
      'wave-plugin': true,
      'pip-plugin': true,
      'hls-quality-plugin': true
    }, prefs => {
      chrome.contextMenus.create({
        id: 'open-in-tab',
        title: 'Open Player in Tab',
        contexts: ['action'],
        type: 'checkbox',
        checked: prefs['open-in-tab'],
        parentId: 'options'
      });
      chrome.contextMenus.create({
        id: 'capture-media',
        title: 'Capture Media from Tab',
        contexts: ['action'],
        type: 'checkbox',
        checked: prefs['capture-media'],
        parentId: 'options'
      });
      chrome.contextMenus.create({
        id: 'screenshot-plugin',
        title: 'Screenshot Button Plugin',
        contexts: ['action'],
        type: 'checkbox',
        checked: prefs['screenshot-plugin'],
        parentId: 'plugins'
      });
      chrome.contextMenus.create({
        id: 'boost-plugin',
        title: 'Boost Button Plugin',
        contexts: ['action'],
        type: 'checkbox',
        checked: prefs['boost-plugin'],
        parentId: 'plugins'
      });
      chrome.contextMenus.create({
        id: 'loop-plugin',
        title: 'Loop Button Plugin',
        contexts: ['action'],
        type: 'checkbox',
        checked: prefs['loop-plugin'],
        parentId: 'plugins'
      });
      chrome.contextMenus.create({
        id: 'shuffle-plugin',
        title: 'Shuffle Button Plugin',
        contexts: ['action'],
        type: 'checkbox',
        checked: prefs['shuffle-plugin'],
        parentId: 'plugins'
      });
      chrome.contextMenus.create({
        id: 'stop-plugin',
        title: 'Stop Button Plugin',
        contexts: ['action'],
        type: 'checkbox',
        checked: prefs['stop-plugin'],
        parentId: 'plugins'
      });
      chrome.contextMenus.create({
        id: 'permission-plugin',
        title: 'Capture Media Button Plugin',
        contexts: ['action'],
        type: 'checkbox',
        checked: prefs['permission-plugin'],
        parentId: 'plugins'
      });
      chrome.contextMenus.create({
        id: 'wave-plugin',
        title: 'Wave Surfer Plugin',
        contexts: ['action'],
        type: 'checkbox',
        checked: prefs['wave-plugin'],
        parentId: 'plugins'
      });
      chrome.contextMenus.create({
        id: 'pip-plugin',
        title: 'Picture in Picture Plugin',
        contexts: ['action'],
        type: 'checkbox',
        checked: prefs['pip-plugin'],
        parentId: 'plugins'
      });
      chrome.contextMenus.create({
        id: 'hls-quality-plugin',
        title: 'HLS Quality Selector Plugin',
        contexts: ['action'],
        type: 'checkbox',
        checked: prefs['hls-quality-plugin'],
        parentId: 'plugins'
      });
    });
  };
  chrome.runtime.onInstalled.addListener(once);
  chrome.runtime.onStartup.addListener(once);
}

chrome.contextMenus.onClicked.addListener(info => {
  if (info.menuItemId === 'user-styling') {
    chrome.tabs.create({
      url: '/data/styling/index.html'
    });
  }
  else if (info.menuItemId === 'capture-media') {
    if (info.checked) {
      const permissions = ['activeTab'];
      if (chrome.runtime.getManifest().manifest_version > 2) {
        permissions.push('scripting');
      }
      const opts = {
        permissions,
        origins: ['*://*/*']
      };
      if (isFF) {
        opts.permissions = ['activeTab'];
      }
      chrome.permissions.request(opts).catch(() => false).then(granted => {
        chrome.storage.local.set({
          'capture-media': granted
        });
        chrome.contextMenus.update('capture-media', {
          checked: granted
        });
      });
    }
    else {
      chrome.storage.local.set({
        'capture-media': info.checked
      });
    }
  }
  else if (info.menuItemId === 'open-in-tab') {
    chrome.storage.local.set({
      [info.menuItemId]: info.checked
    });
  }
  else if (info.menuItemId.endsWith('-plugin')) {
    chrome.storage.local.set({
      [info.menuItemId]: info.checked
    });
  }
  else if (info.menuItemId === 'test-audio') {
    chrome.tabs.create({
      url: 'https://webbrowsertools.com/audio-test/'
    });
  }
  else if (info.menuItemId === 'open-src') {
    chrome.permissions.request({
      origins: [info.srcUrl]
    }).finally(() => onCommand({
      src: info.srcUrl
    }));
  }
  else if (info.menuItemId === 'play-link') {
    chrome.permissions.request({
      origins: [info.linkUrl]
    }).finally(() => onCommand({
      src: info.linkUrl
    }));
  }
  else {
    chrome.runtime.sendMessage({
      method: info.menuItemId
    }, () => {
      const lastError = chrome.runtime.lastError;

      if (lastError) {
        notify('Please open "Media Player" and retry');
      }
    });
  }
});
