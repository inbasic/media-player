/* global launchQueue, onCommand */

launchQueue.setConsumer(launchParams => {
  if (!launchParams.files || !launchParams.files.length) {
    return window.close();
  }
  const bc = new BroadcastChannel('player-view');
  bc.onmessage = async e => {
    if (e.data === 'send-files') {
      const files = [];
      for (const fileHandle of launchParams.files) {
        const file = await fileHandle.getFile();
        files.push(file);
      }
      bc.postMessage({
        files
      });
      bc.close();
      window.close();
    }
  };
  onCommand({
    src: 'transfer-local-files'
  });
});
