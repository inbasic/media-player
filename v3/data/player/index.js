/* globals api */
'use strict';

// resize
window.addEventListener('beforeunload', () => {
  if (api.arguments.mode === 'window') {
    chrome.runtime.sendMessage({
      method: 'save-size',
      size: {
        left: window.screenX,
        top: window.screenY,
        width: Math.max(window.outerWidth, 100),
        height: Math.max(window.outerHeight, 100)
      }
    });
  }
});

// message passing
if (chrome.runtime && chrome.runtime.onMessage) {
  chrome.runtime.onMessage.addListener((request, sender, response) => {
    if (request.method === 'open-src') {
      api.remote([request.src]);
      response(true);
    }
    else if (request.method === 'previous-track') {
      api.previous();
      response(true);
    }
    else if (request.method === 'next-track') {
      api.next();
      response(true);
    }
    else if (request.method === 'toggle-play') {
      api.player.toggle();
      response(true);
    }
  });
}

// port
chrome.runtime.onMessage.addListener((request, sender, response) => {
  if (request.method === 'exists') {
    response(true);
    chrome.runtime.sendMessage({
      method: 'bring-to-front'
    });
  }
});
