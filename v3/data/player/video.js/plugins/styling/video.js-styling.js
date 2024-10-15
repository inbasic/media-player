/* global videojs */
'use strict';

{
  const Plugin = videojs.getPlugin('plugin');

  class StylingPlugin extends Plugin {
    constructor(player, options) {
      super(player, options);

      // user styling
      {
        const css = localStorage.getItem('user-styling');
        console.log(css);
        if (css) {
          const style = document.createElement('style');
          style.textContent = css;
          document.head.appendChild(style);
        }
      }
    }
  }
  videojs.registerPlugin('stylingPlugin', StylingPlugin);
}
