/* global onCommand */
'use strict';

self.importScripts('context.js');
self.importScripts('onCommand.js');

const FORMATS = [
  'avi', 'mp4', 'webm', 'flv', 'mov', 'ogv', '3gp', 'mpg', 'wmv', 'swf', 'mkv', 'vob',
  'pcm', 'wav', 'aac', 'ogg', 'wma', 'flac', 'mid', 'mka', 'm4a', 'voc', 'm3u8', 'mp3'
];

const notify = message => chrome.notifications.create({
  type: 'basic',
  iconUrl: '/data/icons/48.png',
  title: 'Media Player',
  message
}, id => {
  setTimeout(() => chrome.notifications.clear(id), 3000);
});

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
    'capture-media': false
  }, prefs => {
    if (prefs['capture-media'] === false) {
      onCommand();
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
  else if (request.method === 'player-closed') {
    if (request.mode === 'window') {
      chrome.storage.local.set(request.size);
    }
    if (chrome.declarativeNetRequest) {
      chrome.declarativeNetRequest.updateSessionRules({
        removeRuleIds: [sender.tab.id]
      });
    }
  }
  else if (request.method === 'srcs') {
    response(onCommand.srcs || []);
    onCommand.srcs = [];
  }
  else if (request.method === 'save-cache') {
    chrome.storage.local.set({
      cache: request.cache
    });
  }
  else if (request.method === 'open-local-files') {
    onCommand(request);
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

