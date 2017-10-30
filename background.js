'use strict';

var find = () => new Promise((resolve, reject) => chrome.tabs.query({
  url: chrome.runtime.getURL('/data/player/index.html*')
}, tabs => {
  if (tabs.length) {
    resolve(tabs.shift());
  }
  else {
    reject();
  }
}));

var onCommand = (options = {}) => find().then(tab => {
  chrome.windows.update(tab.windowId, {
    focused: true
  });
  return tab;
}).catch(() => new Promise(resolve => chrome.storage.local.get({
  width: 800,
  height: 500,
  left: screen.availLeft + Math.round((screen.availWidth - 800) / 2),
  top: screen.availTop + Math.round((screen.availHeight - 500) / 2),
}, prefs => {
  chrome.windows.create(Object.assign(prefs, {
    url: 'data/player/index.html' + (options.src ? '?src=' + options.src : ''),
    type: 'popup'
  }), w => resolve(w.tabs[0]));
})));

chrome.browserAction.onClicked.addListener(onCommand);

var notify = message => chrome.notifications.create(null, {
  type: 'basic',
  iconUrl: '/data/icons/48.png',
  title: 'Media Player',
  message,
});

var save = prefs => {
  chrome.storage.local.set(prefs);
};

// context-menu
(callback => {
  chrome.runtime.onInstalled.addListener(callback);
  chrome.runtime.onStartup.addListener(callback);
})(() => {
  chrome.contextMenus.create({
    id: 'open-src',
    title: 'Open in Media Player',
    contexts: ['video']
  });
  chrome.contextMenus.create({
    id: 'previous-track',
    title: 'Previous track',
    contexts: ['browser_action']
  });
  chrome.contextMenus.create({
    id: 'next-track',
    title: 'Next track',
    contexts: ['browser_action']
  });
  chrome.contextMenus.create({
    id: 'toggle-play',
    title: 'Toggle play/pause',
    contexts: ['browser_action']
  });
});
chrome.contextMenus.onClicked.addListener(info => {
  if (info.menuItemId === 'open-src') {
    onCommand({
      src: info.srcUrl
    }).then(t => chrome.tabs.sendMessage(t.id, {
      method: 'open-src',
      src: info.srcUrl
    }));
  }
  else {
    find().then(t => chrome.tabs.sendMessage(t.id, {
      method: info.menuItemId
    })).catch(() => notify('Please open "Media Player" and retry'));
  }
});
chrome.commands.onCommand.addListener(method => find().then(t => chrome.tabs.sendMessage(t.id, {
  method
})).catch(() => notify('Please open "Media Player" and retry')));

// FAQs & Feedback
chrome.storage.local.get({
  'version': null,
  'faqs': false
}, prefs => {
  const version = chrome.runtime.getManifest().version;

  if (prefs.version ? (prefs.faqs && prefs.version !== version) : true) {
    chrome.storage.local.set({version}, () => {
      chrome.tabs.create({
        url: 'http://add0n.com/the-media-player.html?version=' + version +
          '&type=' + (prefs.version ? ('upgrade&p=' + prefs.version) : 'install')
      });
    });
  }
});

{
  const {name, version} = chrome.runtime.getManifest();
  chrome.runtime.setUninstallURL('http://add0n.com/feedback.html?name=' + name + '&version=' + version);
}
