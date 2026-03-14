require('dotenv').config();
const { sequelize, Item, User, Coupon } = require('../models');

const items = [
  { title: 'Classic White Shirt', price: 29.99, discountPrice: 24.99, category: 'S',  label: 'P', slug: 'classic-white-shirt',    description: 'A timeless white button-down shirt made from 100% cotton.',       image: 'https://via.placeholder.com/400x300?text=White+Shirt' },
  { title: 'Blue Oxford Shirt',   price: 34.99, discountPrice: null,  category: 'S',  label: 'S', slug: 'blue-oxford-shirt',       description: 'Crisp blue oxford shirt perfect for business casual.',              image: 'https://via.placeholder.com/400x300?text=Blue+Shirt' },
  { title: 'Striped Formal Shirt', price: 39.99, discountPrice: null, category: 'S',  label: 'D', slug: 'striped-formal-shirt',    description: 'Elegant striped shirt for formal occasions.',                        image: 'https://via.placeholder.com/400x300?text=Striped+Shirt' },
  { title: 'Running Jacket',      price: 59.99, discountPrice: 49.99, category: 'SW', label: 'P', slug: 'running-jacket',          description: 'Lightweight running jacket with moisture-wicking technology.',       image: 'https://via.placeholder.com/400x300?text=Running+Jacket' },
  { title: 'Sport Polo',          price: 24.99, discountPrice: null,  category: 'SW', label: 'S', slug: 'sport-polo',              description: 'Breathable sport polo for gym and casual wear.',                      image: 'https://via.placeholder.com/400x300?text=Sport+Polo' },
  { title: 'Training Shorts',     price: 19.99, discountPrice: 14.99, category: 'SW', label: 'P', slug: 'training-shorts',         description: 'Comfortable training shorts with elastic waistband.',                image: 'https://via.placeholder.com/400x300?text=Training+Shorts' },
  { title: 'Winter Parka',        price: 129.99,discountPrice: null,  category: 'OW', label: 'P', slug: 'winter-parka',            description: 'Warm winter parka with insulated lining and hood.',                  image: 'https://via.placeholder.com/400x300?text=Winter+Parka' },
  { title: 'Denim Jacket',        price: 79.99, discountPrice: 69.99, category: 'OW', label: 'S', slug: 'denim-jacket',            description: 'Classic denim jacket with vintage wash.',                            image: 'https://via.placeholder.com/400x300?text=Denim+Jacket' },
  { title: 'Trench Coat',         price: 149.99,discountPrice: null,  category: 'OW', label: 'D', slug: 'trench-coat',             description: 'Sophisticated trench coat for all seasons.',                         image: 'https://via.placeholder.com/400x300?text=Trench+Coat' },
];

async function seed() {
  await sequelize.sync({ force: true });
  console.log('✅ DB synced');

  // Admin user
  await User.create({
    username: 'admin', email: 'admin@shop.com', password: 'admin123',
    firstName: 'Admin', lastName: 'User', isAdmin: true,
  });
  console.log('✅ Admin created  →  admin@shop.com / admin123');

  // Regular user
  await User.create({
    username: 'testuser', email: 'user@shop.com', password: 'user123',
    firstName: 'Test', lastName: 'User',
  });
  console.log('✅ Test user  →  user@shop.com / user123');

  // Items
  await Item.bulkCreate(items);
  console.log(`✅ ${items.length} items seeded`);

  // Coupons
  await Coupon.bulkCreate([
    { code: 'SAVE10', amount: 10 },
    { code: 'SAVE20', amount: 20 },
  ]);
  console.log('✅ Coupons: SAVE10 ($10 off), SAVE20 ($20 off)');

  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
