'use strict';

const FORMATS = [
  'avi', 'mp4', 'webm', 'flv', 'mov', 'ogv', '3gp', 'mpg', 'wmv', 'swf', 'mkv', 'vob',
  'pcm', 'wav', 'aac', 'ogg', 'wma', 'flac', 'mid', 'mka', 'm4a', 'voc', 'm3u8'
];

const notify = message => chrome.notifications.create({
  type: 'basic',
  iconUrl: '/data/icons/48.png',
  title: 'Media Player',
  message
});

const find = () => new Promise((resolve, reject) => {
  chrome.runtime.sendMessage({
    method: 'exists'
  }, r => {
    chrome.runtime.lastError;
    if (r === true) {
      resolve();
    }
    else {
      reject(Error('no window'));
    }
  });
});

const onCommand = (options = {}) => {
  onCommand.srcs = options.srcs || [];

  find().then(() => {
    if (options.src) {
      chrome.runtime.sendMessage({
        method: 'open-src',
        src: options.src
      });
    }
  }).catch(() => new Promise(resolve => {
    chrome.windows.getCurrent().then(win => {
      chrome.storage.local.get({
        'width': 800,
        'height': 500,
        'left': win.left + Math.round((win.width - 800) / 2),
        'top': win.top + Math.round((win.height - 500) / 2),
        'open-in-tab': false
      }, prefs => {
        const args = new URLSearchParams();
        if (options.src) {
          args.set('src', options.src);
        }
        args.set('mode', prefs['open-in-tab'] ? 'tab' : 'window');

        const url = 'data/player/index.html?' + args.toString();
        if (prefs['open-in-tab']) {
          chrome.tabs.create({
            url
          }, resolve);
        }
        else {
          delete prefs['open-in-tab'];
          chrome.windows.create(Object.assign(prefs, {
            url,
            type: 'popup'
          }), w => resolve(w.tabs[0]));
        }
      });
    });
  }));
};

chrome.action.onClicked.addListener(tab => {
  const next = () => {
    if (chrome.scripting) {
      Promise.race([
        chrome.scripting.executeScript({
          target: {
            tabId: tab.id,
            allFrames: true
          },
          func: formats => {
            const links = [];
            [...document.querySelectorAll('video, audio, source')].map(e => {
              if (e.src && e.src.startsWith('http')) {
                try {
                  e.pause();
                }
                catch (e) {}
                links.push(e.src);
              }
            });
            for (const a of [...document.querySelectorAll('a')]) {
              if (a.href && formats.some(s => a.href.includes('.' + s))) {
                links.push(a.href);
              }
            }

            return links;
          },
          args: [FORMATS]
        }),
        new Promise(resolve => setTimeout(resolve, 1000, []))
      ]).then(results => {
        results = results.map(a => a.result).flat().filter(a => a);

        if (results.length) {
          onCommand({
            src: results[0],
            srcs: results
          });
        }
        else {
          onCommand();
        }
      }).catch(() => onCommand());
    }
    else {
      onCommand();
    }
  };
  chrome.storage.local.get({
    'request-active-tab-2': true,
    'capture-media': true
  }, prefs => {
    if (prefs['capture-media'] === false) {
      onCommand();
    }
    else if (prefs['request-active-tab-2']) {
      notify(`The extension can optionally find video links from the active tab when this button is pressed.
This way the extension plays the media on its interface when the button is pressed.`);
      chrome.storage.local.set({
        'request-active-tab-2': false
      });
      chrome.permissions.request({
        permissions: ['activeTab', 'scripting'],
        origins: ['*://*/*']
      }, next);
    }
    else {
      next();
    }
  });
});

chrome.runtime.onMessage.addListener((request, sender, response) => {
  if (request.method === 'bring-to-front') {
    chrome.windows.update(sender.tab.windowId, {
      focused: true
    });
    chrome.tabs.update(sender.tab.id, {
      highlighted: true
    });
  }
  else if (request.method === 'save-size') {
    chrome.storage.local.set(request.size);
  }
  else if (request.method === 'srcs') {
    response(onCommand.srcs || []);
    onCommand.srcs = [];
  }
});

// context-menu
(callback => {
  chrome.runtime.onInstalled.addListener(callback);
  chrome.runtime.onStartup.addListener(callback);
})(() => {
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
    targetUrlPatterns: FORMATS.map(a => '*://*/*.' + a),
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
    id: 'plugins',
    title: 'Player Plugins',
    contexts: ['action']
  });
  chrome.storage.local.get({
    'open-in-tab': false,
    'capture-media': true,
    'screenshot-plugin': true,
    'cast-plugin': true,
    'boost-plugin': true,
    'loop-plugin': true,
    'shuffle-plugin': true,
    'stop-plugin': true,
    'wave-plugin': true
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
      id: 'cast-plugin',
      title: 'Cast Button Plugin',
      contexts: ['action'],
      type: 'checkbox',
      checked: prefs['cast-plugin'],
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
      id: 'wave-plugin',
      title: 'Wave Surfer Plugin',
      contexts: ['action'],
      type: 'checkbox',
      checked: prefs['wave-plugin'],
      parentId: 'plugins'
    });
  });
});
chrome.contextMenus.onClicked.addListener(info => {
  if (info.menuItemId === 'open-in-tab' || info.menuItemId === 'capture-media') {
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
    }, granted => granted && onCommand({
      src: info.srcUrl
    }));
  }
  else if (info.menuItemId === 'play-link') {
    chrome.permissions.request({
      origins: [info.linkUrl]
    }, granted => granted && onCommand({
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
chrome.commands.onCommand.addListener(method => {
  chrome.runtime.sendMessage({
    method
  }, () => {
    const lastError = chrome.runtime.lastError;

    if (lastError) {
      notify('Please open "Media Player" and retry');
    }
  });
});

/* FAQs & Feedback */
{
  const {management, runtime: {onInstalled, setUninstallURL, getManifest}, storage, tabs} = chrome;
  if (navigator.webdriver !== true) {
    const page = getManifest().homepage_url;
    const {name, version} = getManifest();
    onInstalled.addListener(({reason, previousVersion}) => {
      management.getSelf(({installType}) => installType === 'normal' && storage.local.get({
        'faqs': true,
        'last-update': 0
      }, prefs => {
        if (reason === 'install' || (prefs.faqs && reason === 'update')) {
          const doUpdate = (Date.now() - prefs['last-update']) / 1000 / 60 / 60 / 24 > 45;
          if (doUpdate && previousVersion !== version) {
            tabs.query({active: true, currentWindow: true}, tbs => tabs.create({
              url: page + '?version=' + version + (previousVersion ? '&p=' + previousVersion : '') + '&type=' + reason,
              active: reason === 'install',
              ...(tbs && tbs.length && {index: tbs[0].index + 1})
            }));
            storage.local.set({'last-update': Date.now()});
          }
        }
      }));
    });
    setUninstallURL(page + '?rd=feedback&name=' + encodeURIComponent(name) + '&version=' + version);
  }
}

