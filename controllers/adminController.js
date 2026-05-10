const { readRuntimeConfig, writeRuntimeConfig } = require('../utils/runtimeConfigStore');
const User = require('../models/User');

exports.usersList = async (req, res) => {
  const users = await User.find({}, { passwordHash: 0 }).sort({ createdAt: -1 }).lean();
  res.render('admin/users', {
    title: '用户管理',
    active: 'admin',
    users
  });
};

exports.promoteUser = async (req, res) => {
  const id = req.params.id;
  if (!id) return res.redirect('/admin/users');
  await User.findByIdAndUpdate(id, { role: 'admin' });
  res.redirect('/admin/users');
};

exports.demoteUser = async (req, res) => {
  const id = req.params.id;
  if (!id) return res.redirect('/admin/users');
  await User.findByIdAndUpdate(id, { role: 'customer' });
  res.redirect('/admin/users');
};

exports.deleteUser = async (req, res) => {
  const id = req.params.id;
  if (!id) return res.redirect('/admin/users');
  const actor = req.currentUser;
  const target = await User.findById(id).exec();
  if (!target) return res.redirect('/admin/users');
  // superadmin can delete anyone; admin can delete only non-admins
  if (actor.role === 'superadmin' || (actor.role === 'admin' && target.role !== 'admin' && target.role !== 'superadmin')) {
    await User.findByIdAndUpdate(id, { deletedAt: new Date() });
  }
  return res.redirect('/admin/users');
};

exports.similaritySettings = async (req, res) => {
  const config = await readRuntimeConfig();
  res.render('admin/similarity-settings', {
    title: '相似度阈值设置',
    active: 'admin',
    value: Number(config.duplicateSimilarityThreshold || 0.78),
    message: ''
  });
};

exports.saveSimilaritySettings = async (req, res) => {
  const next = Number(req.body.duplicateSimilarityThreshold);
  if (!Number.isFinite(next) || next < 0.5 || next > 0.99) {
    return res.render('admin/similarity-settings', {
      title: '相似度阈值设置',
      active: 'admin',
      value: Number.isFinite(next) ? next : 0.78,
      message: '阈值范围需在 0.50 ~ 0.99 之间。'
    });
  }

  const config = await writeRuntimeConfig({
    duplicateSimilarityThreshold: Number(next.toFixed(2))
  });
  res.render('admin/similarity-settings', {
    title: '相似度阈值设置',
    active: 'admin',
    value: Number(config.duplicateSimilarityThreshold || 0.78),
    message: '保存成功。'
  });
};
