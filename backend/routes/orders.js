const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const redisClient = require('../redisClient');
const { getPredictedEtaFromApi } = require('../utils/etaHelper');

// Cache middleware
async function cache(req, res, next) {
  try {
    const cachedOrders = await redisClient.get('orders');
    if (cachedOrders) {
      console.log('Serving from cache');
      return res.json(JSON.parse(cachedOrders));
    }
    next();
  } catch (err) {
    console.error(err);
    next();
  }
}

// Create New Order with ETA
router.post('/', async (req, res) => {
  console.log('📦 Received body:', req.body);
  try {
    const {
      trackingId,
      customerName,
      pickupAddress,
      deliveryAddress,
      pickupCoordinates,
      deliveryCoordinates
    } = req.body;
    // ✅ Validate coordinates
    if (
      !pickupCoordinates || typeof pickupCoordinates.lat !== 'number' || typeof pickupCoordinates.lon !== 'number' ||
      !deliveryCoordinates || typeof deliveryCoordinates.lat !== 'number' || typeof deliveryCoordinates.lon !== 'number'
    ) {
      console.error('❌ Invalid pickup or delivery coordinates:', { pickupCoordinates, deliveryCoordinates });
      return res.status(400).json({ error: 'Invalid pickup or delivery coordinates' });
    }
    const newOrder = new Order({
      trackingId,
      customerName,
      pickupAddress,
      deliveryAddress,
      pickupCoordinates,
      deliveryCoordinates
    });

    // Predict ETA using live traffic and weather data
    const predictedEta = await getPredictedEtaFromApi(pickupCoordinates, deliveryCoordinates);
    if (predictedEta !== null) {
      newOrder.eta = `${predictedEta.toFixed(2)} min`;
    }

    await newOrder.save();

    // Cache the new order and orders list
    await redisClient.set(`order:${trackingId}`, JSON.stringify(newOrder), { EX: 60 });
    const orders = await Order.find();
    await redisClient.set('orders', JSON.stringify(orders), { EX: 60 });

    res.status(201).json(newOrder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Get all orders
router.get('/', cache, async (req, res) => {
  try {
    const orders = await Order.find();
    await redisClient.set('orders', JSON.stringify(orders), { EX: 60 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get order by trackingId
router.get('/:trackingId', cache, async (req, res) => {
  try {
    const order = await Order.findOne({ trackingId: req.params.trackingId });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    await redisClient.set(`order:${req.params.trackingId}`, JSON.stringify(order), { EX: 60 });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Update order status
router.put('/:trackingId/status', async (req, res) => {
  try {
    const order = await Order.findOneAndUpdate(
      { trackingId: req.params.trackingId },
      { status: req.body.status },
    );
    if (!order) return res.status(404).json({ error: 'Order not found' });

    await redisClient.set(`order:${req.params.trackingId}`, JSON.stringify(order), { EX: 60 });
    const orders = await Order.find();
    await redisClient.set('orders', JSON.stringify(orders), { EX: 60 });

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// Background ETA refresher - every 1 minute
setInterval(async () => {
  try {
    const activeOrders = await Order.find({ statusIn: ['Pending', 'assigned'] });

    for (const order of activeOrders) {
      const newEta = await getPredictedEtaFromApi(order.pickupCoordinates, order.deliveryCoordinates);
      if (newEta !== null) {
        const updatedOrder = await Order.findOneAndUpdate(
          { trackingId: order.trackingId },
          { eta: `${newEta.toFixed(2)} min` }
        );
        await redisClient.set(`order:${order.trackingId}`, JSON.stringify(updatedOrder || order), { EX: 60 });
      }
    }

    const allOrders = await Order.find();
    await redisClient.set('orders', JSON.stringify(allOrders), { EX: 60 });

    console.log('🔄 ETA auto-refresh completed.');
  } catch (err) {
    console.error('ETA refresh failed:', err);
  }
}, 1 * 60 * 1000); // Every 1 minute

module.exports = router;
