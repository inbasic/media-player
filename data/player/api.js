/* globals videojs */
'use strict';

const exts = [
  'avi', 'mp4', 'webm', 'flv', 'mov', 'ogv', '3gp', 'mpg', 'wmv', 'swf', 'mkv', 'vob',
  'pcm', 'wav', 'aac', 'ogg', 'wma', 'flac', 'mid', 'mka', 'm4a', 'voc', 'm3u8'
];

const api = {
  arguments: {},
  config: {
    name: 'Media Player',
    seek: {
      forward: [10, 30],
      backward: [10, 30]
    },
    inactivityTimeout: 4,
    delay: 2,
    repeat: true,
    playbackRates: [0.5, 1, 1.5, 2, 5]
  }
};
window.api = api;
if (window.location.search) {
  window.location.search.substr(1).split('&').forEach(s => {
    const tmp = s.split('=');
    api.arguments[tmp[0]] = decodeURIComponent(tmp[1]);
  });
}

api.player = videojs('video-player', {
  'fluid': true,
  'playbackRates': api.config.playbackRates,
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
    historyPlugin: {},
    waveSurferPlugin: {
      waveColor: 'rgba(115,133,159,.75)',
      progressColor: 'rgba(0, 0, 0, 0.5)',
      height: 300
    },
    smartInactivePlugin: {
      inactivityTimeout: api.config.inactivityTimeout * 1000
    }
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
  const playlist = files.filter(f => {
    if (f.type) {
      return f.type.startsWith('video/') || f.type.startsWith('audio/');
    }
    else {
      return exts.some(e => f.name.toLowerCase().indexOf('.' + e) !== -1);
    }
  }).map(file => {
    // looking for subtitles
    const base = file.name.replace(/\.[^.]*$/, '');
    const caption = files.filter(f => f !== file && f.name.startsWith(base)).shift();
    return {
      name: file.name.replace(/\.[^.]+$/, ''),
      duration: '--',
      type: file.type,
      caption,
      sources: [{
        src: URL.createObjectURL(file),
        type: file.type
      }]
    };
  });
  api.append(playlist);
};
api.remote = async urls => {
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
      name: src.split('/').pop()
    }]
  }));

  await Promise.all(playlist.map(o => {
    const controller = new AbortController();
    return fetch(o.sources[0].src, {
      signal: controller.signal
    }).then(r => {
      const type = r.headers.get('content-type');
      if (type) {
        o.sources[0].type = type;
      }
    }).catch(e => console.warn('cannot extract content-type', e)).finally(() => controller.abort());
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
