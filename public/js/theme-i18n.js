// Handles theme toggle and simple client-side i18n using data-i18n attributes.
(function(){
  function applyTheme(isDark){
    if(isDark) document.body.classList.add('dark');
    else document.body.classList.remove('dark');
    localStorage.setItem('themeDark', isDark? '1' : '0');
    const btn = document.getElementById('themeToggle');
    if(btn) btn.textContent = isDark? '☀️' : '🌙';
  }

  function toggleTheme(){
    applyTheme(!document.body.classList.contains('dark'));
  }

  // Simple translation dictionary
  const dict = {
    en: {
      'nav.home': 'Home',
      'nav.second': 'Second-hand',
      'nav.cart': 'Cart',
      'nav.sell': 'Sell',
      'nav.orders': 'Orders',
      'nav.admin': 'Admin',
      'nav.messages': 'Messages',
      'nav.favorites': 'Favorites',
      'nav.mine': 'Mine',
      'footer.contributors': 'Contributors: Liu, Lu, Shi, Hua, Deng'
    },
    zh: {}
  };

  function applyLang(lang){
    document.documentElement.lang = (lang === 'en')? 'en' : 'zh-CN';
    localStorage.setItem('lang', lang);
    document.querySelectorAll('[data-i18n]').forEach(el=>{
      const key = el.getAttribute('data-i18n');
      const val = (dict[lang] && dict[lang][key]) || null;
      if(val) el.textContent = val;
    });
    const btn = document.getElementById('langToggle');
    if(btn) btn.textContent = (lang==='en')? 'EN' : '中';
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    // init theme
    const dark = localStorage.getItem('themeDark') === '1';
    applyTheme(dark);
    const themeBtn = document.getElementById('themeToggle');
    if(themeBtn) themeBtn.addEventListener('click', toggleTheme);

    // init lang
    const lang = localStorage.getItem('lang') || 'zh';
    applyLang(lang);
    const langBtn = document.getElementById('langToggle');
    if(langBtn) langBtn.addEventListener('click', ()=> applyLang((localStorage.getItem('lang')==='en')? 'zh' : 'en'));

    // captcha refresh
    const captcha = document.getElementById('captchaImage');
    if(captcha) captcha.addEventListener('click', ()=>{ captcha.src = '/captcha?ts='+Date.now(); });
  });
})();
