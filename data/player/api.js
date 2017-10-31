/* globals videojs */
'use strict';

var api = {
  arguments: {},
  config: {
    name: 'Media Player',
    seek: {
      forward: [10, 30],
      backward: [10, 30]
    },
    inactivityTimeout: 4,
    delay: 2,
    repeat: true
  }
};
if (window.location.search) {
  window.location.search.substr(1).split('&').forEach(s => {
    const tmp = s.split('=');
    api.arguments[tmp[0]] = decodeURIComponent(tmp[1]);
  });
}

api.player = videojs('video-player', {
  'fluid': true,
  'inactivityTimeout': api.config.inactivityTimeout * 1000,
  'plugins': {
    playlist: {},
    playlistButtonPlugin: {},
    playlistMenuExtraPlugin: {},
    titlePlugin: {},
    trackVolumePlugin: {},
    keyboardPlugin: {},
    mousePlugin: {},
    captionPlugin: {},
    seekButtonsPlugin: api.config.seek,
    stopButtonPlugin: {},
    historyPlugin: {}
  }
}, () => {
  document.title = api.config.name;
  if (api.arguments.src) {
    api.remote([api.arguments.src]);
  }
  api.player.playlist.autoadvance(api.config.delay);
  api.player.playlist.repeat(api.config.repeat);

  api.player.playlistUi(document.getElementById('playlist'));
});

api.player.bigPlayButton.on('click', () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.setAttribute('multiple', true);
  input.addEventListener('change', () => api.local([...input.files]));
  input.click();
});

// api.next
// api.previous
// api.local
// api.remote
api.next = () => {
  if (!api.player.playlist.next()) {
    api.toast('No more tracks');
  }
};
api.previous = () => {
  if (!api.player.playlist.previous()) {
    api.toast('No previous track');
  }
};
api.append = list => {
  const olist = api.player.playlist();
  api.player.playlist([...olist, ...list], olist.length);
  api.player.play();
};
api.local = files => {
  const playlist = files
  .filter(f => f.type && (f.type.startsWith('video/') || f.type.startsWith('audio/')))
  .map(file => {
    // looking for subtitles
    const base = file.name.replace(/\.[^.]*$/, '');
    const caption = files.filter(f => f !== file && f.name.startsWith(base)).shift();
    return {
      name: file.name.replace(/\.[^.]+$/, ''),
      duration: '--',
      caption,
      sources: [{
        src: URL.createObjectURL(file),
        type: file.type
      }]
    };
  });
  api.append(playlist);
};
api.remote = urls => {
  const playlist = urls.map(src => {
    if (/google\.[^./]+\/url?/.test(src)) {
      const tmp = /url=([^&]+)/.exec(src);
      if (tmp && tmp.length) {
        src = decodeURIComponent(tmp[1]);
      }
    }
    return src;
  }).map(src => ({
    sources: [{
      src,
      type: 'video/mp4',
      name: 'unKnown'
    }]
  }));
  api.append(playlist);
};
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
if (chrome.runtime && chrome.runtime.getBackgroundPage) {
  chrome.runtime.getBackgroundPage(b => api.background = b);
}
