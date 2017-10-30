/* global videojs */
'use strict';

// api.srt2webvtt
{
  function convertSrtCue(caption) {
    // remove all html tags for security reasons
    //srt = srt.replace(/<[a-zA-Z\/][^>]*>/g, '');

    let cue = '';
    const s = caption.split(/\n/);
    while (s.length > 3) {
      s[2] += '\n' + s.pop();
    }
    let line = 0;

    // detect identifier
    if (!s[0].match(/\d+:\d+:\d+/) && s[1].match(/\d+:\d+:\d+/)) {
      cue += s[0].match(/\w+/) + '\n';
      line += 1;
    }

    // get time strings
    if (s[line].match(/\d+:\d+:\d+/)) {
      // convert time string
      const m = s[1].match(/(\d+):(\d+):(\d+)(?:,(\d+))?\s*--?>\s*(\d+):(\d+):(\d+)(?:,(\d+))?/);
      if (m) {
        cue += m[1] + ':' + m[2] + ':' + m[3] + '.' + m[4] + ' --> ' +
          m[5] + ':' + m[6] + ':' + m[7] + '.' + m[8] + '\n';
        line += 1;
      }
      else {
        // Unrecognized timestring
        return '';
      }
    }
    else {
      // file format error or comment lines
      return '';
    }

    // get cue text
    if (s[line]) {
      cue += s[line] + '\n\n';
    }

    return cue;
  }

  const srt2webvtt = data => {
    // remove dos newlines
    let srt = data.replace(/\r+/g, '');
    // trim white space start and end
    srt = srt.replace(/^\s+|\s+$/g, '');

    // get cues
    const cuelist = srt.split('\n\n');
    let result = '';

    if (cuelist.length > 0) {
      result += 'WEBVTT\n\n';
      for (var i = 0; i < cuelist.length; i += 1) {
        result += convertSrtCue(cuelist[i]);
      }
    }

    return result;
  };

  const Plugin = videojs.getPlugin('plugin');

  class CaptionPlugin extends Plugin {
    constructor(player, options) {
      super(player, options);

      const add = src => {
        player.addRemoteTextTrack({
          default: true,
          src,
          label: 'English',
          mode: 'showing'
        }, false);
        window.setTimeout(() => URL.revokeObjectURL(src), 1000);
      };

      player.caption = file => {
        if (file.name.endsWith('.vtt')) {
          add(URL.createObjectURL(file));
        }
        else if (file.name.endsWith('.srt')) {
          const reader = new FileReader();
          reader.onload = () => {
            const blob = new Blob([srt2webvtt(reader.result)], {
              type: 'text/vtt'
            });
            add(URL.createObjectURL(blob));
          };
          reader.readAsText(file);
        }
      };
    }
  }
  videojs.registerPlugin('captionPlugin', CaptionPlugin);
}
