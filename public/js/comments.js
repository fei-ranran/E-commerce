// Client-side code for comment form: star rating, file upload to /uploads, and media tracking
(function () {
  const form = document.getElementById('comment-form');
  if (!form) return;

  const starInput = document.querySelector('[data-star-input]');
  const ratingValue = document.querySelector('[data-rating-value]');
  const fileInput = document.getElementById('comment-file-input');
  const mediaList = document.getElementById('comment-media-list');
  const mediaInput = document.querySelector('[data-media-input]');

  let selectedRating = 5;
  let uploadedMedia = [];

  if (starInput) {
    starInput.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-value]');
      if (!btn) return;
      selectedRating = Number(btn.getAttribute('data-value')) || 5;
      if (ratingValue) ratingValue.value = selectedRating;
      // render stars
      [...starInput.querySelectorAll('button.star')].forEach(b => {
        const v = Number(b.getAttribute('data-value'));
        b.textContent = v <= selectedRating ? '★' : '☆';
      });
    });
  }

  async function uploadFile(file) {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch('/uploads', {
      method: 'POST',
      body: form
    });
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
          // show preview
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
      // clear file input
      fileInput.value = '';
    });
  }

  // ensure hidden input is set before submit
  form.addEventListener('submit', (e) => {
    if (mediaInput) mediaInput.value = uploadedMedia;
  });
})();
