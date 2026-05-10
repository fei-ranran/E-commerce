// Codex, GPT-5.5 High, OpenAI.
var toggle = document.querySelector('[data-nav-toggle]');
var nav = document.querySelector('[data-nav]');

if (toggle && nav) {
  toggle.addEventListener('click', function () {
    nav.classList.toggle('open');
  });
}

// initialize UI helpers
try{
  // load theme/i18n UI if present
  var s1 = document.createElement('script');
  s1.src = '/js/ui.js';
  s1.defer = true;
  document.head.appendChild(s1);
}catch(e){}

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

var conditionSelect = document.querySelector('[data-condition-select]');
var wearRow = document.querySelector('[data-wear-row]');

function syncWearRow() {
  if (!conditionSelect || !wearRow) return;
  var isUsed = conditionSelect.value === 'used';
  if (isUsed) {
    wearRow.removeAttribute('data-hidden');
    wearRow.style.display = '';
  } else {
    wearRow.setAttribute('data-hidden', 'true');
    wearRow.style.display = 'none';
    var wg = document.querySelector('[data-field="wearGrade"]');
    if (wg) wg.value = '';
  }
}

if (conditionSelect && wearRow) {
  conditionSelect.addEventListener('change', syncWearRow);
  syncWearRow();
}

// 分类与类型联动：分类以"二手"开头时自动切到二手
var categoryInput = document.querySelector('[data-field="category"]');
if (categoryInput && conditionSelect) {
  categoryInput.addEventListener('input', function () {
    if (String(categoryInput.value || '').trim().startsWith('二手') && conditionSelect.value === 'new') {
      conditionSelect.value = 'used';
      syncWearRow();
    }
  });
  categoryInput.addEventListener('change', function () {
    if (String(categoryInput.value || '').trim().startsWith('二手') && conditionSelect.value === 'new') {
      conditionSelect.value = 'used';
      syncWearRow();
    }
  });
}

function initPublishFormAssist() {
  var form = document.querySelector('[data-publish-form]');
  if (!form) return;

  var nameInput = form.querySelector('[data-field="name"]');
  var descInput = form.querySelector('[data-field="description"]');
  var priceInput = form.querySelector('[data-field="price"]');
  var stockInput = form.querySelector('[data-field="stock"]');
  var categoryInput = form.querySelector('[data-field="category"]');
  var conditionInput = form.querySelector('[data-field="condition"]');
  var wearGradeInput = form.querySelector('[data-field="wearGrade"]');
  var suggestNode = form.querySelector('[data-smart-suggest]');
  var requiredItem = form.querySelector('[data-check="required"]');
  var priceItem = form.querySelector('[data-check="price"]');
  var descItem = form.querySelector('[data-check="description"]');

  var keywordHints = [
    { words: ['键盘', '鼠标', '显示器', '耳机', '路由器', 'nas'], category: '二手数码', min: 80, max: 1800 },
    { words: ['相机', '微单', '平板', '电脑', '主机'], category: '数码设备', min: 800, max: 9000 },
    { words: ['教材', '书', '学习', 'typescript', 'javascript'], category: '图书教材', min: 20, max: 150 },
    { words: ['简历', '咨询', '设计', '运维', '部署'], category: '服务', min: 100, max: 1200 },
    { words: ['椅', '桌', '沙发', '床'], category: '二手家具', min: 100, max: 1000 },
    { words: ['鞋', '外套', '衣', '球鞋'], category: '二手服饰', min: 60, max: 600 }
  ];

  function setCheckItem(node, ok, text) {
    if (!node) return;
    node.classList.toggle('ok', !!ok);
    node.classList.toggle('warn', !ok);
    if (text) node.textContent = text;
  }

  function suggestByName(name) {
    var n = String(name || '').toLowerCase();
    for (var i = 0; i < keywordHints.length; i++) {
      var hit = keywordHints[i];
      if (
        hit.words.some(function (word) {
          return n.indexOf(String(word).toLowerCase()) >= 0;
        })
      ) {
        return hit;
      }
    }
    return null;
  }

  function syncChecks() {
    var requiredOk =
      !!(nameInput && nameInput.value.trim()) &&
      !!(descInput && descInput.value.trim()) &&
      !!(priceInput && priceInput.value) &&
      !!(stockInput && stockInput.value) &&
      !!(categoryInput && categoryInput.value.trim());
    setCheckItem(requiredItem, requiredOk, requiredOk ? '必填项已填写完整。' : '请填写必填项（名称、描述、价格、库存、分类）。');

    var descLen = (descInput && descInput.value.trim().length) || 0;
    if (descLen < 12) {
      setCheckItem(descItem, false, '描述偏短（建议至少 12 字），可补充成色/功能/发货信息。');
    } else if (descLen > 240) {
      setCheckItem(descItem, false, '描述偏长（建议不超过 240 字），可精简重点卖点。');
    } else {
      setCheckItem(descItem, true, '描述长度合适。');
    }

    var suggest = suggestByName(nameInput && nameInput.value);
    var p = Number((priceInput && priceInput.value) || 0);
    if (suggestNode) {
      if (suggest) {
        suggestNode.textContent =
          '推荐分类：' +
          suggest.category +
          '，建议价格区间：¥' +
          suggest.min +
          ' - ¥' +
          suggest.max +
          '。';
        if (categoryInput && !categoryInput.value.trim()) {
          categoryInput.value = suggest.category;
        }
      } else {
        suggestNode.textContent = '暂无明确推荐，可继续填写具体品牌或型号以获得建议。';
      }
    }

    if (p <= 0) {
      setCheckItem(priceItem, false, '请填写有效价格。');
      return;
    }

    if (suggest && p < suggest.min * 0.5) {
      setCheckItem(priceItem, false, '当前价格远低于市场区间，建议核对后再发布。');
    } else if (suggest && p > suggest.max * 2) {
      setCheckItem(priceItem, false, '当前价格显著偏高，建议补充配置说明。');
    } else {
      setCheckItem(priceItem, true, '价格区间基本合理。');
    }

    if (conditionInput && wearGradeInput && conditionInput.value === 'new' && wearGradeInput.value) {
      setCheckItem(requiredItem, false, '新品无需填写二手成色，请切换为二手或清空成色。');
    }
  }

  ['input', 'change'].forEach(function (eventName) {
    form.addEventListener(eventName, syncChecks);
  });
  syncChecks();
}

initPublishFormAssist();

function initFavoriteActions() {
  var toggleBtn = document.querySelector('[data-favorite-toggle]');
  var alertBtn = document.querySelector('[data-favorite-alert-toggle]');
  if (!toggleBtn) return;

  var productId = toggleBtn.getAttribute('data-product-id');

  function setToggleUi(isFavorited, favoriteId) {
    toggleBtn.setAttribute('data-favorited', isFavorited ? '1' : '0');
    toggleBtn.setAttribute('data-favorite-id', favoriteId || '');
    toggleBtn.textContent = isFavorited ? '已收藏' : '收藏/关注';
    if (alertBtn) {
      alertBtn.setAttribute('data-favorite-id', favoriteId || '');
      if (!isFavorited) {
        alertBtn.setAttribute('disabled', 'disabled');
        alertBtn.textContent = '降价提醒：已关闭';
      } else {
        alertBtn.removeAttribute('disabled');
      }
    }
  }

  // Codex, GPT-5.5 High, OpenAI.
  // Server-rendered favorite state is the source of truth; localStorage can leak stale state across accounts.
  // end: Codex, GPT-5.5 High, OpenAI.

  toggleBtn.addEventListener('click', function () {
    fetch('/favorites/toggle/' + productId, {
      method: 'POST',
      headers: { Accept: 'application/json' }
    })
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        if (!data || !data.ok) return;
        setToggleUi(!!data.favorited, data.favoriteId || '');
      })
      .catch(function () {});
  });

  if (alertBtn) {
    alertBtn.addEventListener('click', function () {
      var favoriteId = alertBtn.getAttribute('data-favorite-id');
      if (!favoriteId) return;
      fetch('/favorites/alert-toggle/' + favoriteId, {
        method: 'POST',
        headers: { Accept: 'application/json' }
      })
        .then(function (res) {
          return res.json();
        })
        .then(function (data) {
          if (!data || !data.ok) return;
          alertBtn.setAttribute('data-alert-enabled', data.alertEnabled ? '1' : '0');
          alertBtn.textContent = '降价提醒：' + (data.alertEnabled ? '已开启' : '已关闭');
        })
        .catch(function () {});
    });
  }
}

initFavoriteActions();

function initPriceHistoryChart() {
  var canvas = document.querySelector('[data-price-history-chart]');
  var dataNode = document.getElementById('price-history-data');
  if (!canvas || !dataNode) return;
  var rangeBtns = document.querySelectorAll('[data-price-range]');
  var rangeStatusNode = document.querySelector('[data-price-range-status]');

  var raw = [];
  try {
    raw = JSON.parse(dataNode.textContent || '[]');
  } catch (error) {
    raw = [];
  }
  if (!Array.isArray(raw) || raw.length === 0) return;

  var points = raw
    .map(function (item) {
      return {
        t: new Date(item.changedAt),
        p: Number(item.price)
      };
    })
    .filter(function (item) {
      return !isNaN(item.t.getTime()) && !isNaN(item.p);
    })
    .sort(function (a, b) {
      return a.t - b.t;
    });

  if (points.length === 0) return;

  function withRange(rangeKey) {
    if (rangeKey === 'all') return points.slice();
    var days = rangeKey === '30d' ? 30 : 7;
    var from = Date.now() - days * 24 * 60 * 60 * 1000;
    var filtered = points.filter(function (item) {
      return item.t.getTime() >= from;
    });
    return filtered.length > 0 ? filtered : [points[points.length - 1]];
  }

  function buildDataset(data) {
    return {
      labels: data.map(function (item) {
        return item.t.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
      }),
      prices: data.map(function (item) {
        return item.p;
      })
    };
  }

  var chart = null;
  if (window.Chart) {
    var seed = buildDataset(withRange('7d'));
    chart = new window.Chart(canvas, {
      type: 'line',
      data: {
        labels: seed.labels,
        datasets: [
          {
            label: '价格 (¥)',
            data: seed.prices,
            borderColor: '#50a3a2',
            backgroundColor: 'rgba(80, 163, 162, 0.12)',
            pointBackgroundColor: '#3d7c7b',
            borderWidth: 2,
            pointRadius: 3,
            pointHoverRadius: 5,
            fill: true,
            tension: 0.3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: false,
            ticks: {
              callback: function (value) {
                return '¥' + value;
              }
            }
          }
        }
      }
    });
  }

  function rangeLabel(key) {
    if (key === '30d') return '近30天';
    if (key === 'all') return '全部时间';
    return '近7天';
  }

  function renderRange(key) {
    var next = buildDataset(withRange(key));
    if (chart) {
      chart.data.labels = next.labels;
      chart.data.datasets[0].data = next.prices;
      chart.update();
    }
    if (rangeStatusNode) {
      rangeStatusNode.textContent = '当前区间：' + rangeLabel(key) + '（' + next.prices.length + ' 次价格记录）';
    }
  }

  rangeBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var nextRange = btn.getAttribute('data-price-range') || 'all';
      renderRange(nextRange);

      rangeBtns.forEach(function (item) {
        item.classList.remove('active');
      });
      btn.classList.add('active');
    });
  });

  renderRange('7d');
}

initPriceHistoryChart();

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
