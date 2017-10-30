/* globals api */
'use strict';

Object.assign(document.body, {
  ondragover: () => false,
  ondragend: () => false,
  ondrop: e => {
    e.preventDefault();
    if (e.dataTransfer.files.length) {
      api.local([...e.dataTransfer.files]);
    }
    const src = e.dataTransfer.getData('text/uri-list');
    if (src) {
      api.remote([src]);
    }
  }
});
