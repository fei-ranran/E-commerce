// Client-side upload helper for message compose form
(function () {
  const fileInput = document.getElementById('message-file-input');
  const mediaList = document.getElementById('message-media-list');
  const mediaInput = document.querySelector('input[data-media-input]');
  let uploadedMedia = [];

  async function uploadFile(file) {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/uploads', { method: 'POST', body: fd });
    if (!res.ok) throw new Error('upload failed');
    return res.json();
  }

  if (fileInput) {
    fileInput.addEventListener('change', async (e) => {
      const files = Array.from(e.target.files || []);
      for (const f of files) {
        const placeholder = document.createElement('div');
        placeholder.className = 'media-item uploading';
        placeholder.textContent = '上传中...';
        mediaList.appendChild(placeholder);
        try {
          const data = await uploadFile(f);
          uploadedMedia.push((data.type || 'image') + ':' + data.url);
          placeholder.className = 'media-item';
          placeholder.textContent = '';
          if (data.type === 'video') {
            const v = document.createElement('video'); v.src = data.url; v.controls = true; v.width = 240; placeholder.appendChild(v);
          } else {
            const img = document.createElement('img'); img.src = data.url; img.alt = 'preview'; img.width = 240; placeholder.appendChild(img);
          }
        } catch (err) {
          placeholder.className = 'media-item error';
          placeholder.textContent = '上传失败';
        }
        if (mediaInput) mediaInput.value = uploadedMedia;
      }
      fileInput.value = '';
    });
  }

  const form = document.getElementById('message-form');
  if (form) form.addEventListener('submit', () => { if (mediaInput) mediaInput.value = uploadedMedia; });
})();
