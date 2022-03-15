/* globals api */
'use strict';

const drop = async es => {
  const files = [];
  const entries = es.map(f => f.webkitGetAsEntry ? f.webkitGetAsEntry() : ({
    isFile: true,
    file(c) {
      c(f);
    }
  })).filter(a => a);

  const checkEntry = async entry => {
    const file = await new Promise(resolve => entry.file(resolve));

    if (file.type) {
      if (file.type.startsWith('audio/') || file.type.startsWith('video/')) {
        files.push(file);
      }
    }
    else {
      if (file.name.endsWith('.ts')) {
        file.vtype = 'application/vnd.apple.mpegurl';
        files.push(file);
      }
      else if (file.name.startsWith('.') === false) {
        files.push(file);
      }
    }
  };

  const readEntries = entry => new Promise(resolve => {
    const directoryReader = entry.createReader();
    directoryReader.readEntries(async entries => {
      for (const entry of entries) {
        if (entry.isFile) {
          await checkEntry(entry);
        }
        else {
          await readEntries(entry);
        }
      }
      resolve();
    });
  });

  for (const entry of entries) {
    if (entry.isFile) {
      await checkEntry(entry);
    }
    else {
      await readEntries(entry);
    }
  }

  console.log(files);

  return files;
};


Object.assign(document.body, {
  ondragover: () => false,
  ondragend: () => false,
  ondrop: e => {
    e.preventDefault();

    if (e.dataTransfer.files.length) {
      drop([...e.dataTransfer.items]).then(api.local).catch(e => {
        console.warn(e);
        api.local([...e.dataTransfer.files]);
      });
    }
    const src = e.dataTransfer.getData('text/uri-list');
    if (src) {
      api.remote([src]);
    }
  }
});
