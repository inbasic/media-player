'use strict';
/* global videojs */

const isFF = /Firefox/.test(navigator.userAgent);

const exts = [
  'avi', 'mp4', 'webm', 'flv', 'mov', 'ogv', '3gp', 'mpg', 'wmv', 'swf', 'mkv', 'vob',
  'pcm', 'wav', 'aac', 'ogg', 'wma', 'flac', 'mid', 'mka', 'm4a', 'voc', 'm3u8'
];

const api = {
  e: document.createElement('video'),
  validate(type) {
    return api.e.canPlayType(type);
  },
  arguments: {},
  config: {
    name: 'Media Player (videojs v' + videojs.VERSION + ')',
    seek: {
      forward: (localStorage.getItem('seek.forward') || '10, 30').split(/\s*,\s*/).map(Number),
      backward: (localStorage.getItem('seek.backward') || '10, 30').split(/\s*,\s*/).map(Number)
    },
    inactivityTimeout: 4,
    playbackRates: (localStorage.getItem('rates') || '0.25, 0.5, 0.75, 1, 1.5, 2').split(/\s*,\s*/).map(Number),
    delay: Number(localStorage.getItem('delay') || '1') // seconds
  }
};
window.api = api;
if (window.location.search) {
  window.location.search.substr(1).split('&').forEach(s => {
    const tmp = s.split('=');
    api.arguments[tmp[0]] = decodeURIComponent(tmp[1]);
  });
}

const bc = new BroadcastChannel('player-view');
bc.onmessage = e => {
  if (e.data.files) {
    api.local([...e.data.files]);
  }
};

api.player = videojs('video-player', {
  'fluid': true,
  'playbackRates': api.config.playbackRates,
  'userActions': {
    doubleClick: false
  },
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
    historyPlugin: {},
    smartInactivePlugin: {
      inactivityTimeout: api.config.inactivityTimeout * 1000
    },
    playBackRatePlugin: {},
    stylingPlugin: {}
  }
}, () => {
  document.title = api.config.name;

  if (api.arguments.src) {
    api.remote([api.arguments.src]);
  }

  api.player.playlistUi({
    el: document.getElementById('playlist')
  });
});

// async plugins
chrome.storage.local.get({
  'screenshot-plugin': isFF ? false : true,
  'boost-plugin': isFF ? false : true,
  'loop-plugin': true,
  'shuffle-plugin': true,
  'stop-plugin': true,
  'wave-plugin': true,
  'permission-plugin': true,
  'pip-plugin': true,
  'hls-quality-plugin': true
}, prefs => {
  if (prefs['screenshot-plugin']) {
    api.player.screenshotButtonPlugin();
  }
  if (prefs['boost-plugin']) {
    api.player.boostButtonPlugin();
  }
  if (prefs['loop-plugin']) {
    api.player.loopButtonPlugin();
  }
  if (prefs['shuffle-plugin']) {
    api.player.shuffleButtonPlugin();
  }
  if (prefs['stop-plugin']) {
    api.player.stopButtonPlugin();
  }
  if (prefs['permission-plugin']) {
    api.player.permissionButtonPlugin();
  }
  if (prefs['wave-plugin']) {
    api.player.waveSurferPlugin({
      waveColor: 'rgba(115,133,159,.75)',
      progressColor: 'rgba(0, 0, 0, 0.5)',
      height: 300
    });
  }
  if (prefs['pip-plugin'] === false) {
    api.player.controlBar.pictureInPictureToggle.dispose();
  }
  if (prefs['hls-quality-plugin']) {
    // api.player.qualityLevels();
    api.player.hlsQualitySelectorPlugin();
  }
});

api.player.on('error', e => {
  setTimeout(() => {
    if (api.player.playlist.next()) {
      api.player.play();
    }
  }, 5000);

  console.warn('Error', e, api.player.error());
  document.title = (api.player.error()?.message || 'Cannot Play this Track');
  api.toast(api.player.currentSrc(), {timeout: 5});
});

api.player.bigPlayButton.el_.title = `Click: Open local resources
Shift + Click: Open remote resources`;
api.player.bigPlayButton.on('click', e => {
  if (e.shiftKey) {
    api.remote.prompt();
  }
  else {
    const input = document.createElement('input');
    input.type = 'file';
    input.setAttribute('multiple', true);
    input.addEventListener('change', () => api.local([...input.files]));
    input.click();
  }
});

// api.next
// api.previous
// api.local
// api.remote
api.next = () => {
  if (api.player.playlist.next()) {
    if (api.player.paused()) {
      api.player.play();
    }
  }
  else {
    api.toast('No more tracks');
  }
};
api.previous = () => {
  if (api.player.playlist.previous()) {
    if (api.player.paused()) {
      api.player.play();
    }
  }
  else {
    api.toast('No previous track');
  }
};
api.append = list => {
  const olist = api.player.playlist();
  api.player.playlist([...olist, ...list], olist.length);
  api.player.play();
};

const dtype = (type = '') => {
  if (type === '') {
    return 'video/mp4';
  }
  // support M3U8
  if (type.toLowerCase().includes('mpegurl')) {
    return 'application/x-mpegURL';
  }
  if (type.startsWith('application/') || type.startsWith('video/')) {
    if (!api.validate(type)) {
      return 'video/mp4';
    }
  }
  return type;
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
    const name = file.name;

    return {
      name,
      duration: '--',
      type: dtype(file.type),
      caption,
      sources: [{
        name,
        src: URL.createObjectURL(file),
        type: dtype(file.type)
      }]
    };
  });
  if (playlist.length === 0) {
    api.toast('No media is detected');
  }

  api.append(playlist);
};
api.remote = urls => chrome.runtime.sendMessage({
  method: 'srcs'
}, async r => {
  urls.push(...r);
  urls = urls.filter((s, i, l) => s && l.indexOf(s) === i);

  document.title = 'Please wait...';
  const playlist = urls.map(src => {
    if (/google\.[^./]+\/url?/.test(src)) {
      const tmp = /url=([^&]+)/.exec(src);
      if (tmp && tmp.length) {
        src = decodeURIComponent(tmp[1]);
      }
    }
    return src;
  }).map(src => {
    const name = src.split('/').pop().slice(0, 100);
    return {
      name,
      sources: [{
        src,
        name
      }]
    };
  });

  await Promise.all(playlist.map(o => {
    const controller = new AbortController();

    if (o.sources[0].src.startsWith('https://www.youtube.com/watch?v=')) {
      o.sources[0].type = 'video/youtube';
      return Promise.resolve();
    }
    return fetch(o.sources[0].src, {
      signal: controller.signal
    }).then(r => {
      const type = r.headers.get('content-type');
      o.sources[0].type = dtype(type);
    }).catch(e => console.warn('cannot extract content-type', e)).finally(() => controller.abort());
  }));
  api.append(playlist);
});
// Get cross-page native files
api.remote = new Proxy(api.remote, {
  apply(target, self, args) {
    if (args[0].includes('transfer-local-files')) {
      return bc.postMessage('send-files');
    }
    return Reflect.apply(target, self, args);
  }
});

api.remote.prompt = async () => {
  const cl = (await navigator.clipboard.readText().catch(() => '')) || '';

  const links = prompt('Comma-separated list of network URLs', cl);
  if (links) {
    // 'https://assets7.ign.com/master/videos/zencoder/2019/06/11/,640/d3e7aa2687f580e185c47f9288ccd139-347000,853/d3e7aa2687f580e185c47f9288ccd139-724000,960/d3e7aa2687f580e185c47f9288ccd139-1129000,1280/d3e7aa2687f580e185c47f9288ccd139-1910000,1920/d3e7aa2687f580e185c47f9288ccd139-3906000,-1560300082/master.m3u8, https://www.w3schools.com/html/mov_bbb.mp4'
    const sp = links.split(/\s*,(?=\s*http)/).map(a => a.trim()).filter(a => a);
    api.remote(sp);
  }
};
// api.toast
{
  let id;
  const elem = document.getElementById('toast');
  api.toast = (msg, options = {
    timeout: 2
  }) => {
    clearTimeout(id);
    elem.setAttribute('style', options.style || '');
    elem.textContent = msg;
    id = setTimeout(() => elem.textContent = '', options.timeout * 1000);
  };
  api.player.on('ready', () => {
    const video = api.player.el().querySelector('video');
    video.insertAdjacentElement('afterEnd', elem);
  });
}

