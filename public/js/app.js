// Codex, GPT-5.5 High, OpenAI.
var toggle = document.querySelector('[data-nav-toggle]');
var nav = document.querySelector('[data-nav]');

if (toggle && nav) {
  toggle.addEventListener('click', function () {
    nav.classList.toggle('open');
  });
}

var imageInput = document.querySelector('[data-image-input]');
var imageValue = document.querySelector('[data-image-value]');
var imagePreview = document.querySelector('[data-image-preview]');
var imageHint = document.querySelector('[data-image-hint]');

if (imageInput && imageValue && imagePreview) {
  imageInput.addEventListener('change', function () {
    var file = imageInput.files && imageInput.files[0];
    if (!file) return;

    if (!file.type.match(/^image\//)) {
      imageInput.value = '';
      if (imageHint) imageHint.textContent = '请选择图片文件。';
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      imageInput.value = '';
      if (imageHint) imageHint.textContent = '图片过大，请选择 2MB 以内的图片。';
      return;
    }

    var reader = new FileReader();
    reader.onload = function () {
      imageValue.value = reader.result;
      imagePreview.classList.remove('empty');
      imagePreview.innerHTML = '<img src="' + reader.result + '" alt="商品图片预览">';
      if (imageHint) imageHint.textContent = '图片已选择，可直接发布商品。';
    };
    reader.readAsDataURL(file);
  });
}
// end: Codex, GPT-5.5 High, OpenAI.

// 注册页密码规范校验
const passwordInput = document.getElementById('passwordInput');
const rules = {
  length: document.getElementById('ruleLength'),
  upper: document.getElementById('ruleUpper'),
  lower: document.getElementById('ruleLower'),
  digit: document.getElementById('ruleDigit')
};

function setRuleStatus(el, isValid) {
  if (!el) return;
  if (isValid) {
    el.style.color = '#50a3a2';
    el.style.textDecoration = 'line-through';
  } else {
    el.style.color = '#b03a2e';
    el.style.textDecoration = 'none';
  }
}

if (passwordInput) {
  passwordInput.addEventListener('input', function () {
    const pwd = this.value;
    const isValidLength = pwd.length >= 8 && pwd.length <= 20;
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasDigit = /[0-9]/.test(pwd);

    setRuleStatus(rules.length, isValidLength);
    setRuleStatus(rules.upper, hasUpper);
    setRuleStatus(rules.lower, hasLower);
    setRuleStatus(rules.digit, hasDigit);

    const hint = document.getElementById('passwordHint');
    const allValid = isValidLength && hasUpper && hasLower && hasDigit;
    if (allValid) {
      hint.textContent = '✅ 密码格式正确';
      hint.style.color = '#50a3a2';
    } else {
      hint.textContent = '请按要求设置密码';
      hint.style.color = '#b03a2e';
    }
  });
}