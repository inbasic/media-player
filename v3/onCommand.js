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

        const url = '/data/player/index.html?' + args.toString();
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
  }).then(tab => {
    // unblock CORS if possible
    if (chrome.declarativeNetRequest) {
      const tabId = tab.id;
      chrome.declarativeNetRequest.updateSessionRules({
        removeRuleIds: [tabId],
        addRules: [{
          'id': tabId,
          'priority': 1,
          'action': {
            'type': 'modifyHeaders',
            'responseHeaders': [{
              'operation': 'set',
              'header': 'access-control-allow-origin',
              'value': '*'
            }]
          },
          'condition': {
            'resourceTypes': ['xmlhttprequest', 'media'],
            'tabIds': [tabId]
          }
        }]
      });
    }

    return tab;
  }));
};
