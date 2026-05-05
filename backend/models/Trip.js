const { query, getPool } = require('../config/db');

function mapOrderRow(row) {
  return {
    id: row.id,
    _id: String(row.id),
    trackingId: row.tracking_id,
    customerName: row.customer_name,
    pickupAddress: row.pickup_address,
    deliveryAddress: row.delivery_address,
    pickupCoordinates: {
      lat: row.pickup_lat,
      lon: row.pickup_lon
    },
    deliveryCoordinates: {
      lat: row.delivery_lat,
      lon: row.delivery_lon
    },
    status: row.status,
    eta: row.eta,
    deliveryPartner: row.delivery_partner,
    assignedTo: row.assigned_to,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapTripBaseRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    _id: String(row.id),
    tripId: row.trip_id,
    driverUserId: row.driver_id,
    status: row.status,
    startTime: row.start_time,
    endTime: row.end_time,
    currentLocation: {
      lat: row.current_lat,
      lng: row.current_lng
    },
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function hydrateTrips(baseTrips) {
  if (baseTrips.length === 0) return [];

  const driverIds = [...new Set(baseTrips.map((t) => t.driverUserId))];
  const tripIds = baseTrips.map((t) => t.id);

  const driverRows = await query(
    `SELECT id, username, role, name, email, created_at
     FROM users
     WHERE id IN (${driverIds.map(() => '?').join(',')})`,
    driverIds
  );

  const driversById = new Map(
    driverRows.map((driver) => [
      driver.id,
      {
        id: driver.id,
        _id: String(driver.id),
        username: driver.username,
        role: driver.role,
        name: driver.name,
        email: driver.email,
        createdAt: driver.created_at
      }
    ])
  );

  const tripOrderRows = await query(
    `SELECT to_map.trip_id,
            o.id, o.tracking_id, o.customer_name, o.pickup_address, o.delivery_address,
            o.pickup_lat, o.pickup_lon, o.delivery_lat, o.delivery_lon,
            o.status, o.eta, o.delivery_partner, o.assigned_to, o.created_at, o.updated_at
     FROM trip_orders to_map
     JOIN orders o ON o.id = to_map.order_id
     WHERE to_map.trip_id IN (${tripIds.map(() => '?').join(',')})
     ORDER BY o.id DESC`,
    tripIds
  );

  const ordersByTripId = new Map();
  for (const row of tripOrderRows) {
    const list = ordersByTripId.get(row.trip_id) || [];
    list.push(mapOrderRow(row));
    ordersByTripId.set(row.trip_id, list);
  }

  return baseTrips.map((trip) => ({
    ...trip,
    driverId: driversById.get(trip.driverUserId) || null,
    orderIds: ordersByTripId.get(trip.id) || []
  }));
}

class Trip {
  static async create({ tripId, driverId, orderIds = [], status = 'pending' }) {
    const pool = getPool();
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [tripResult] = await conn.execute(
        'INSERT INTO trips (trip_id, driver_id, status) VALUES (?, ?, ?)',
        [tripId, Number(driverId), status]
      );

      if (Array.isArray(orderIds) && orderIds.length > 0) {
        for (const orderId of orderIds) {
          await conn.execute(
            'INSERT INTO trip_orders (trip_id, order_id) VALUES (?, ?)',
            [tripResult.insertId, Number(orderId)]
          );
        }
      }

      await conn.commit();
      return Trip.findById(tripResult.insertId);
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }

  static async find(filters = {}) {
    const clauses = [];
    const values = [];

    if (filters.driverUserId !== undefined) {
      clauses.push('driver_id = ?');
      values.push(Number(filters.driverUserId));
    }

    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const rows = await query(
      `SELECT id, trip_id, driver_id, status, start_time, end_time, current_lat, current_lng, created_at, updated_at
       FROM trips ${where}
       ORDER BY id DESC`,
      values
    );

    const baseTrips = rows.map((row) => mapTripBaseRow(row));
    return hydrateTrips(baseTrips);
  }

  static async findById(id) {
    const rows = await query(
      `SELECT id, trip_id, driver_id, status, start_time, end_time, current_lat, current_lng, created_at, updated_at
       FROM trips
       WHERE id = ?
       LIMIT 1`,
      [Number(id)]
    );
    const base = mapTripBaseRow(rows[0]);
    if (!base) return null;
    const hydrated = await hydrateTrips([base]);
    return hydrated[0] || null;
  }

  static async findByTripId(tripId) {
    const rows = await query(
      `SELECT id, trip_id, driver_id, status, start_time, end_time, current_lat, current_lng, created_at, updated_at
       FROM trips
       WHERE trip_id = ?
       LIMIT 1`,
      [tripId]
    );
    const base = mapTripBaseRow(rows[0]);
    if (!base) return null;
    const hydrated = await hydrateTrips([base]);
    return hydrated[0] || null;
  }

  static async updateById(id, updates = {}) {
    const current = await Trip.findById(id);
    if (!current) return null;

    const nextStatus = updates.status !== undefined ? updates.status : current.status;
    const nextStartTime = updates.startTime !== undefined ? updates.startTime : current.startTime;
    const nextEndTime = updates.endTime !== undefined ? updates.endTime : current.endTime;
    const nextLat = updates.currentLocation?.lat !== undefined ? updates.currentLocation.lat : current.currentLocation?.lat;
    const nextLng = updates.currentLocation?.lng !== undefined ? updates.currentLocation.lng : current.currentLocation?.lng;
    const nextDriverId = updates.driverId !== undefined ? Number(updates.driverId) : current.driverUserId;

    await query(
      `UPDATE trips
       SET status = ?, start_time = ?, end_time = ?, current_lat = ?, current_lng = ?, driver_id = ?
       WHERE id = ?`,
      [nextStatus, nextStartTime || null, nextEndTime || null, nextLat ?? null, nextLng ?? null, nextDriverId, Number(id)]
    );

    return Trip.findById(id);
  }

  static async updateCurrentLocationByTripId(tripId, lat, lng) {
    const trip = await Trip.findByTripId(tripId);
    if (!trip) return null;

    await query(
      'UPDATE trips SET current_lat = ?, current_lng = ? WHERE id = ?',
      [lat, lng, trip.id]
    );

    return Trip.findById(trip.id);
  }

  static async findCurrentByDriver(driverId) {
    const rows = await query(
      `SELECT id, trip_id, driver_id, status, start_time, end_time, current_lat, current_lng, created_at, updated_at
       FROM trips
       WHERE driver_id = ? AND status IN ('assigned', 'in-progress')
       ORDER BY id DESC
       LIMIT 1`,
      [Number(driverId)]
    );
    const base = mapTripBaseRow(rows[0]);
    if (!base) return null;
    const hydrated = await hydrateTrips([base]);
    return hydrated[0] || null;
  }
}

module.exports = Trip;
