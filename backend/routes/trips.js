const express = require('express');
const router = express.Router();
const Trip = require('../models/Trip');
const User = require('../models/User');
const redisClient = require('../redisClient');
const authenticateToken = require('../middleware/auth');
const authorizeRoles = require('../middleware/roleCheck');

// Cache middleware for GET /api/trips
async function cacheTrips(req, res, next) {
  try {
    const cachedTrips = await redisClient.get('trips');
    if (cachedTrips) {
      console.log('Serving trips from cache');
      return res.json(JSON.parse(cachedTrips));
    }
    next();
  } catch (err) {
    console.error('CacheTrips error:', err);
    next();
  }
}

// Create new trip
// Only manager can create a trip
router.post('/', authenticateToken, authorizeRoles('manager'), async (req, res) => {
  try {
    const { tripId, driverId, orderIds = [], status = 'pending' } = req.body;

    if (!tripId || !driverId) {
      return res.status(400).json({ error: 'tripId and driverId are required' });
    }

    const newTrip = await Trip.create({ tripId, driverId, orderIds, status });
    res.status(201).json(newTrip);
  } catch (err) {
    console.error('Create trip error:', err);
    res.status(500).json({ error: 'Failed to create trip' });
  }
});
// Get all trips
// manager: all trips
// delivery: only trips assigned to them
// customer: denied
// Get all trips with cache
router.get('/', authenticateToken, authorizeRoles('manager', 'delivery'), cacheTrips, async (req, res) => {
  try {
    let trips;
    if (req.user.role === 'manager') {
      trips = await Trip.find();
    } else if (req.user.role === 'delivery') {
      trips = await Trip.find({ driverUserId: req.user.id });
    }
    await redisClient.set('trips', JSON.stringify(trips), { EX: 60 });
    res.json(trips);
  } catch (err) {
    console.error('Fetch trips error:', err);
    res.status(500).json({ error: 'Failed to fetch trips' });
  }
});
// Get trip by id
// manager: any trip
// delivery: only assigned trips
// customer: denied
// Get trip by id with cache
router.get('/:id', authenticateToken, authorizeRoles('manager', 'delivery'),async (req, res) => {
  try {
    const cacheKey = `trip:${req.params.id}`;
    const cachedTrip = await redisClient.get(cacheKey);
    if (cachedTrip) {
      console.log('Serving trip from cache');
      return res.json(JSON.parse(cachedTrip));
    }
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    if (req.user.role === 'delivery' && String(trip.driverUserId) !== String(req.user.id)) {
        return res.status(403).json({ error: 'Access denied' });
    }
    await redisClient.set(cacheKey, JSON.stringify(trip), { EX: 60 });
    res.json(trip);
  } catch (err) {
    console.error('Fetch trip by ID error:', err);
    res.status(500).json({ error: 'Failed to fetch trip' });
  }
});
// Update trip by id
// Only manager can update
// Update trip by id and update cache
router.put('/:id', authenticateToken, authorizeRoles('manager'), async (req, res) => {
  try {
    const updatedTrip = await Trip.updateById(req.params.id, req.body);
    if (!updatedTrip) return res.status(404).json({ error: 'Trip not found' });

    const cacheKey = `trip:${req.params.id}`;
    await redisClient.set(cacheKey, JSON.stringify(updatedTrip), { EX: 60 });

    // Refresh trips list cache
    const trips = await Trip.find();
    await redisClient.set('trips', JSON.stringify(trips), { EX: 60 });

    res.json(updatedTrip);
  } catch (err) {
    console.error('Update trip error:', err);
    res.status(500).json({ error: 'Failed to update trip' });
  }
});

// Start trip
// Start trip
// Only delivery assigned to this trip or manager
router.post('/:id/start', authenticateToken, authorizeRoles('manager', 'delivery'), async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    
    if (req.user.role === 'delivery' && String(trip.driverUserId) !== String(req.user.id)) {
        return res.status(403).json({ error: 'Access denied' });
    }

    const updatedTrip = await Trip.updateById(req.params.id, {
      status: 'in-progress',
      startTime: new Date()
    });

    const cacheKey = `trip:${req.params.id}`;
    await redisClient.set(cacheKey, JSON.stringify(updatedTrip), { EX: 60 });

    res.json(updatedTrip);
  } catch (err) {
    res.status(500).json({ error: 'Failed to start trip' });
  }
});
// End trip
// Only delivery assigned to this trip or manager
// End trip
router.post('/:id/end', authenticateToken,  authorizeRoles('manager', 'delivery'), async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    
     if (req.user.role === 'delivery' && String(trip.driverUserId) !== String(req.user.id)) {
        return res.status(403).json({ error: 'Access denied' });
    }
    
    const updatedTrip = await Trip.updateById(req.params.id, {
      status: 'completed',
      endTime: new Date()
    });

    const cacheKey = `trip:${req.params.id}`;
    await redisClient.set(cacheKey, JSON.stringify(updatedTrip), { EX: 60 });

    res.json(updatedTrip);
  } catch (err) {
    res.status(500).json({ error: 'Failed to end trip' });
  }
});

// Assign orders to a delivery user by creating a trip
// Only manager can assign
router.post('/assign', authenticateToken, authorizeRoles('manager'), async (req, res) => {
  try {
    const { driverId, orderIds } = req.body;

    // Validate driver exists and role is delivery
    const driver = await User.findById(driverId);
    if (!driver || driver.role !== 'delivery') {
      return res.status(400).json({ error: 'Invalid delivery driver ID' });
    }

    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({ error: 'orderIds must be a non-empty array' });
    }

    // Generate unique tripId (you can improve this with a better generator)
    const tripId = `trip_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const newTrip = await Trip.create({
      tripId,
      driverId,
      orderIds,
      status: 'pending'
    });

    res.status(201).json(newTrip);
  } catch (err) {
    console.error('Assign trip error:', err);
    res.status(500).json({ error: 'Failed to assign trip' });
  }
});

module.exports = router;
