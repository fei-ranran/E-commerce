const User = require('../models/User');

async function seedUsers() {
  const users = [
    { username: 'superadmin', email: 'superadmin@local', password: 'superadmin', role: 'superadmin' },
    { username: 'admin', email: 'admin@local', password: 'admin', role: 'admin' }
  ];

  for (const u of users) {
    const exist = await User.findOne({ username: u.username }).exec();
    if (!exist) {
      const hash = User.hashPassword(u.password);
      await User.create({ username: u.username, email: u.email, passwordHash: hash, role: u.role });
      console.log('Seeded user:', u.username);
    }
  }
}

module.exports = seedUsers;
