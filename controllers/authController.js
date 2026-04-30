// Codex, GPT-5.5 High, OpenAI.
const User = require('../models/User');

function renderLogin(res, message) {
  res.render('auth/login', {
    title: '登录',
    active: 'login',
    message
  });
}

function renderRegister(res, message) {
  res.render('auth/register', {
    title: '注册',
    active: 'register',
    message
  });
}

exports.loginForm = (req, res) => {
  renderLogin(res, '');
};

exports.registerForm = (req, res) => {
  renderRegister(res, '');
};

exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return renderRegister(res, '请填写完整的注册信息。');
  }
  
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,20}$/;
  if (!passwordRegex.test(password)) {
    return res.render('auth/register', {
      title: '注册',
      active: '',
      message: '密码必须8-20位，包含大小写字母和数字！',
      username,
      email
    });
  }

  const existed = await User.findOne({
    $or: [{ username }, { email }]
  });

  if (existed) {
    return renderRegister(res, '用户名或邮箱已经被使用。');
  }

  const user = new User({
    username,
    email,
    passwordHash: User.hashPassword(password)
  });
  await user.save();

  res.cookie('cream_user', user._id.toString(), {
    httpOnly: true,
    sameSite: 'lax'
  });
  res.redirect('/');
};

exports.login = async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user || !user.verifyPassword(password)) {
    return renderLogin(res, '用户名或密码错误。');
  }

  res.cookie('cream_user', user._id.toString(), {
    httpOnly: true,
    sameSite: 'lax'
  });
  res.redirect('/');
};

exports.logout = (req, res) => {
  res.clearCookie('cream_user');
  res.redirect('/');
};
// 注销账户（我帮你加的）
exports.deleteAccount = async (req, res) => {
  if (!req.currentUser) {
    return res.redirect('/login');
  }
  await User.findByIdAndDelete(req.currentUser._id);
  res.clearCookie('cream_user');
  res.redirect('/');
};
//end: Codex, GPT-5.5 High, OpenAI.