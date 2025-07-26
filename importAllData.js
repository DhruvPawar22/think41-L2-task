const mongoose = require('mongoose');
const csv = require('csvtojson');
const path = require('path');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/ecommerce_chatbot', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Schemas
const DistributionCenter = mongoose.model('DistributionCenter', new mongoose.Schema({
  id: Number,
  name: String,
  latitude: Number,
  longitude: Number,
}));

const InventoryItem = mongoose.model('InventoryItem', new mongoose.Schema({
  id: Number,
  product_id: Number,
  created_at: Date,
  sold_at: Date,
  cost: Number,
  product_category: String,
  product_name: String,
  product_brand: String,
  product_retail_price: Number,
  product_department: String,
  product_sku: String,
  product_distribution_center_id: Number,
}));

const OrderItem = mongoose.model('OrderItem', new mongoose.Schema({
  id: Number,
  order_id: Number,
  user_id: Number,
  product_id: Number,
  inventory_item_id: Number,
  status: String,
  created_at: Date,
  shipped_at: Date,
  delivered_at: Date,
  returned_at: Date,
}));

const Order = mongoose.model('Order', new mongoose.Schema({
  order_id: Number,
  user_id: Number,
  status: String,
  gender: String,
  created_at: Date,
  returned_at: Date,
  shipped_at: Date,
  delivered_at: Date,
  num_of_item: Number,
}));

const Product = mongoose.model('Product', new mongoose.Schema({
  id: Number,
  cost: Number,
  category: String,
  name: String,
  brand: String,
  retail_price: Number,
  department: String,
  sku: String,
  distribution_center_id: Number,
}));

const User = mongoose.model('User', new mongoose.Schema({
  id: Number,
  first_name: String,
  last_name: String,
  email: String,
  age: Number,
  gender: String,
  state: String,
  street_address: String,
  postal_code: String,
  city: String,
  country: String,
  latitude: Number,
  longitude: Number,
  traffic_source: String,
  created_at: Date,
}));

// Helper to import CSV
async function importCSV(model, fileName) {
  const filePath = path.join(__dirname, 'archive', fileName);
  const jsonArray = await csv().fromFile(filePath);
  await model.insertMany(jsonArray);
  console.log(`${fileName} imported`);
}

// Main import function
async function main() {
  try {
    await importCSV(DistributionCenter, 'distribution_centers.csv');
    await importCSV(InventoryItem, 'inventory_items.csv');
    await importCSV(OrderItem, 'order_items.csv');
    await importCSV(Order, 'orders.csv');
    await importCSV(Product, 'products.csv');
    await importCSV(User, 'users.csv');
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
  }
}

main();