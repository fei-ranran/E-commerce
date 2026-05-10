// Handles theme and language toggles and captcha refresh handling
(function(){
  function $(sel){return document.querySelector(sel)}

  // Theme toggle
  const themeBtn = document.getElementById('themeToggle');
  function applyTheme(dark){
    if (dark) document.body.classList.add('dark'); else document.body.classList.remove('dark');
    if (themeBtn) themeBtn.textContent = dark ? '☀️' : '🌙';
    try{localStorage.setItem('cream_theme_dark', dark? '1':'0')}catch(e){}
  }
  if (themeBtn){
    themeBtn.addEventListener('click', ()=>{
      const isDark = document.body.classList.contains('dark');
      applyTheme(!isDark);
    });
  }
  // init
  try{applyTheme(localStorage.getItem('cream_theme_dark') === '1')}catch(e){}

  // Language toggle: set cookie and reload so server renders selected language
  const langBtn = document.getElementById('langToggle');
  function setLangButtonText(lang){
    if (langBtn) langBtn.textContent = lang === 'en' ? '中' : 'EN';
  }
  if (langBtn){
    langBtn.addEventListener('click', ()=>{
      const cookies = (document.cookie || '').split(';').reduce(function(acc, part){
        var idx = part.indexOf('='); if (idx<0) return acc; acc[part.slice(0,idx).trim()]=decodeURIComponent(part.slice(idx+1)); return acc;}, {});
      const current = cookies.cream_lang === 'en' ? 'en' : 'zh';
      const next = current === 'en' ? 'zh' : 'en';
      try{ document.cookie = 'cream_lang=' + encodeURIComponent(next) + '; path=/; max-age=' + (60*60*24*30); }catch(e){}
      try{ localStorage.setItem('cream_lang', next); }catch(e){}
      // reload so server-side templates render in chosen language
      location.reload();
    });
  }
  // init button text from cookie/localStorage
  try{ setLangButtonText((localStorage.getItem('cream_lang') === 'en' || (document.cookie || '').indexOf('cream_lang=en')>-1) ? 'en' : 'zh'); }catch(e){}

  // captcha refresh
  const captchaImg = document.getElementById('captchaImage');
  if (captchaImg){
    captchaImg.addEventListener('click', ()=>{captchaImg.src = '/captcha?ts=' + Date.now()});
  }
})();
