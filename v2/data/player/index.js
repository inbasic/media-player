/* globals api */
'use strict';

// resize
window.addEventListener('beforeunload', () => {
  if (api.background && api.arguments.mode === 'window') {
    api.background.save({
      left: window.screenX,
      top: window.screenY,
      width: Math.max(window.outerWidth, 100),
      height: Math.max(window.outerHeight, 100)
    });
  }
});

// message passing
if (chrome.runtime && chrome.runtime.onMessage) {
  chrome.runtime.onMessage.addListener(request => {
    if (request.method === 'open-src') {
      api.remote([request.src]);
    }
    else if (request.method === 'previous-track') {
      api.previous();
    }
    else if (request.method === 'next-track') {
      api.next();
    }
    else if (request.method === 'toggle-play') {
      api.player.toggle();
    }
  });
}

// port
chrome.runtime.connect({
  name: 'media-player'
});
