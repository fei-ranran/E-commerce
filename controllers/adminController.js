const { readRuntimeConfig, writeRuntimeConfig } = require('../utils/runtimeConfigStore');

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
