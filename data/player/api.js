/* globals videojs */
'use strict';

var api = {
  arguments: {}
};
if (window.location.search) {
  window.location.search.substr(1).split('&').forEach(s => {
    const tmp = s.split('=');
    api.arguments[tmp[0]] = decodeURIComponent(tmp[1]);
  });
}

api.player = videojs('video-player', {
  'fluid': true,
  'inactivityTimeout': 4000,
  'plugins': {
    trackVolumePlugin: {},
    keyboardPlugin: {},
    mousePlugin: {},
    captionPlugin: {},
    seekButtonsPlugin: {
      forward: [10, 30],
      backward: [10, 30]
    },
    stopButtonPlugin: {},
    historyPlugin: {}
  }
}, () => {
  document.title = 'Media Player';
  if (api.arguments.src) {
    api.remote([api.arguments.src]);
  }
});

api.player.bigPlayButton.on('click', () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.setAttribute('multiple', true);
  input.addEventListener('change', () => api.local([...input.files]));
  input.click();
});

// api.next
// api.local
// api.remote
{
  const queue = {
    media: []
  };
  let index = -1;
  api.next = () => {
    if (queue.media.length) {
      index += 1;
      if (index >= queue.media.length) {
        index = queue.media.length - 1;
        api.toast('No next track');
        return;
      }
      const media = queue.media[index];
      api.player.src({
        src: media.src,
        type: media.type,
        name: media.name
      });
      if (media.caption) {
        api.player.caption(media.caption);
      }
      api.player.play();
      document.title = media.name + ' - Media Player';
      api.toast(media.name);
    }
  };
  api.previous = () => {
    index -= 2;
    if (index < -1) {
      index = 0;
      return api.toast('No previous track');
    }
    api.next();
  };
  api.local = files => {
    files.filter(f => f.type).forEach(file => {
      if (file.type.startsWith('video/') || file.type.startsWith('audio/')) {
        const obj = {
          src: URL.createObjectURL(file),
          type: file.type,
          name: file.name
        };
        queue.media.push(obj);
        // looking for subtitles
        const base = file.name.replace(/\.[^.]*$/, '');
        const caption = files.filter(f => f !== file && f.name.startsWith(base)).shift();
        if (caption) {
          obj.caption = caption;
        }
      }
    });
    console.log(queue.media);
    api.next();
  };
  api.remote = urls => {
    urls.forEach(src => {
      if (/google\.[^./]+\/url?/.test(src)) {
        const tmp = /url=([^&]+)/.exec(src);
        if (tmp && tmp.length) {
          src = decodeURIComponent(tmp[1]);
        }
      }
      queue.media.push({
        src,
        type: 'video/mp4',
        name: 'unknown'
      });
    });
    api.next();
  };
}

// api.toast
{
  let id;
  const elem = document.getElementById('toast');
  api.toast = (msg, options = {
    timeout: 2
  }) => {
    window.clearTimeout(id);
    elem.setAttribute('style', options.style || '');
    elem.textContent = msg;
    id = window.setTimeout(() => elem.textContent = '', options.timeout * 1000);
  };
}

// api.background
chrome.runtime.getBackgroundPage(b => api.background = b);
