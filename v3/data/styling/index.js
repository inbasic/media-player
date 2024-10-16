let id;

self.save.onclick = () => {
  localStorage.setItem('user-styling', self.editor.value);

  self.toast.textContent = 'User styles are updated';
  clearTimeout(id);
  id = setTimeout(() => {
    self.toast.textContent = '';
  }, 750);
};

self.editor.value = localStorage.getItem('user-styling') || '';

self.addEventListener('keydown', e => {
  if (e.code === 'KeyS' && (e.metaKey || e.ctrlKey)) {
    e.preventDefault();
    self.save.click();
  }
});
