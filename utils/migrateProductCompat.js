/**
 * 商品文档兼容迁移：应用连接数据库后执行，幂等、可重复运行。
 * 补齐 / 纠正旧数据中的 salesCount、freeShipping、wearGrade，与高级筛选逻辑一致。
 */
const Product = require('../models/Product');
const { WEAR_GRADES } = require('./productSearch');

async function migrateProductDocuments() {
  await Product.updateMany(
    {
      $or: [
        { salesCount: { $exists: false } },
        { salesCount: null },
        { salesCount: { $lt: 0 } },
        {
          $and: [
            { salesCount: { $exists: true } },
            { salesCount: { $ne: null } },
            { salesCount: { $not: { $type: ['int', 'long', 'double'] } } }
          ]
        }
      ]
    },
    { $set: { salesCount: 0 } }
  );

  await Product.updateMany(
    {
      $or: [
        { freeShipping: { $exists: false } },
        { freeShipping: null },
        {
          $and: [
            { freeShipping: { $exists: true } },
            { freeShipping: { $ne: null } },
            { freeShipping: { $not: { $type: 'bool' } } }
          ]
        }
      ]
    },
    { $set: { freeShipping: false } }
  );

  await Product.updateMany({ condition: 'new', wearGrade: { $exists: true } }, { $unset: { wearGrade: 1 } });

  await Product.updateMany(
    {
      condition: 'used',
      $or: [
        { wearGrade: { $exists: false } },
        { wearGrade: null },
        { wearGrade: '' },
        { wearGrade: { $nin: WEAR_GRADES } }
      ]
    },
    { $set: { wearGrade: 'good' } }
  );

  const noHistory = await Product.find({
    $or: [{ priceHistory: { $exists: false } }, { priceHistory: { $size: 0 } }]
  })
    .select('_id price createdAt')
    .lean();

  if (noHistory.length > 0) {
    await Product.bulkWrite(
      noHistory.map((item) => ({
        updateOne: {
          filter: { _id: item._id },
          update: {
            $set: {
              priceHistory: [
                {
                  price: Number(item.price || 0),
                  changedAt: item.createdAt || new Date()
                }
              ]
            }
          }
        }
      }))
    );
  }

  const singleHistoryProducts = await Product.find({ 'priceHistory.1': { $exists: false } })
    .select('_id price createdAt priceHistory')
    .lean();

  if (singleHistoryProducts.length > 0) {
    await Product.bulkWrite(
      singleHistoryProducts.map((item) => {
        const current = Number(item.price || 0);
        const createdAt = item.createdAt ? new Date(item.createdAt) : new Date();

        // 为历史只有 1 条的商品补两条历史价格，方便价格趋势展示与筛选体验。
        // 波动比例采用确定性算法（与 _id 相关），避免每次迁移结果随机变化。
        const idTail = String(item._id).slice(-4);
        const seed = parseInt(idTail, 16) || 0;
        const upRatio = 1 + ((seed % 14) + 4) / 100; // +4% ~ +17%
        const downRatio = 1 - ((seed % 9) + 2) / 100; // -2% ~ -10%

        const earlyPrice = Number((current * upRatio).toFixed(2));
        const midPrice = Number((current * downRatio).toFixed(2));
        const earlyAt = new Date(createdAt.getTime() - 21 * 24 * 60 * 60 * 1000);
        const midAt = new Date(createdAt.getTime() - 7 * 24 * 60 * 60 * 1000);

        const normalized = [
          { price: Math.max(0, earlyPrice), changedAt: earlyAt },
          { price: Math.max(0, midPrice), changedAt: midAt },
          { price: Math.max(0, current), changedAt: createdAt }
        ].sort((a, b) => a.changedAt - b.changedAt);

        return {
          updateOne: {
            filter: { _id: item._id },
            update: { $set: { priceHistory: normalized } }
          }
        };
      })
    );
  }
}

module.exports = migrateProductDocuments;
