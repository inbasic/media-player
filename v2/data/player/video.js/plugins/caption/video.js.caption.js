/* global videojs */
'use strict';

// api.srt2webvtt
{
  const convertSrtCue = caption => {
    // remove all html tags for security reasons
    // srt = srt.replace(/<[a-zA-Z\/][^>]*>/g, '');

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
  };

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
      for (let i = 0; i < cuelist.length; i += 1) {
        result += convertSrtCue(cuelist[i]);
      }
    }

    return result;
  };

  const Plugin = videojs.getPlugin('plugin');
  const Button = videojs.getComponent('Button');

  class CaptionPlugin extends Plugin {
    constructor(player, options) {
      super(player, options);

      const add = src => {
        player.addRemoteTextTrack({
          default: true,
          src,
          label: 'Subtitle',
          mode: 'showing'
        }, false);

        button.hide();
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

      let button;
      player.on('loadstart', () => {
        const index = player.playlist.currentItem();
        if (index > -1) {
          const item = player.playlist()[index];
          const caption = item.caption;
          if (caption) {
            player.caption(caption);
          }
          else {
            button.show();
          }
        }
      });
      player.on('ready', () => {
        if (player.controlBar.ccButton) {
          return;
        }
        // Subclass the component (see 'extend' doc for more info)
        const CC = videojs.extend(Button, {
          handleClick: function() {
            const index = player.playlist.currentItem();
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'text/vtt|text/srt';
            input.onchange = () => {
              const file = input.files[0];
              if (file) {
                player.caption(file);
                player.playlist()[index].caption = file;
              }
            };
            input.click();
          },
          buildCSSClass: function() {
            return 'vjs-subs-caps-button vjs-menu-button vjs-menu-button-popup vjs-control vjs-button';
          }
        });
        // Register the new component
        Button.registerComponent('ccButton', CC);
        button = player.controlBar.ccButton = player.controlBar.addChild('ccButton');
        button.el().innerText = '+CC';
        button.el().title = 'Add Subtitle';
        player.controlBar.el().insertBefore(
          button.el(),
          player.controlBar.chaptersButton.el()
        );
      });
    }
  }
  videojs.registerPlugin('captionPlugin', CaptionPlugin);
}
