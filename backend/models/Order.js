const { query } = require('../config/db');

function mapRowToOrder(row) {
  if (!row) return null;
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

class Order {
  constructor({
    trackingId,
    customerName,
    pickupAddress,
    deliveryAddress,
    pickupCoordinates,
    deliveryCoordinates,
    status = 'Pending',
    eta = null,
    deliveryPartner = null,
    assignedTo = null
  } = {}) {
    this.id = null;
    this._id = null;
    this.trackingId = trackingId;
    this.customerName = customerName || null;
    this.pickupAddress = pickupAddress || null;
    this.deliveryAddress = deliveryAddress || null;
    this.pickupCoordinates = pickupCoordinates || { lat: null, lon: null };
    this.deliveryCoordinates = deliveryCoordinates || { lat: null, lon: null };
    this.status = status;
    this.eta = eta;
    this.deliveryPartner = deliveryPartner;
    this.assignedTo = assignedTo;
    this.createdAt = null;
    this.updatedAt = null;
  }

  static async find(filters = {}) {
    const clauses = [];
    const values = [];

    if (Array.isArray(filters.statusIn) && filters.statusIn.length > 0) {
      clauses.push(`status IN (${filters.statusIn.map(() => '?').join(',')})`);
      values.push(...filters.statusIn);
    }

    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const rows = await query(
      `SELECT id, tracking_id, customer_name, pickup_address, delivery_address,
              pickup_lat, pickup_lon, delivery_lat, delivery_lon,
              status, eta, delivery_partner, assigned_to, created_at, updated_at
       FROM orders ${where}
       ORDER BY id DESC`,
      values
    );

    return rows.map((row) => mapRowToOrder(row));
  }

  static async findOne(filters = {}) {
    if (filters.trackingId !== undefined) {
      const rows = await query(
        `SELECT id, tracking_id, customer_name, pickup_address, delivery_address,
                pickup_lat, pickup_lon, delivery_lat, delivery_lon,
                status, eta, delivery_partner, assigned_to, created_at, updated_at
         FROM orders WHERE tracking_id = ? LIMIT 1`,
        [filters.trackingId]
      );
      const mapped = mapRowToOrder(rows[0]);
      return mapped ? Object.assign(new Order(mapped), mapped) : null;
    }

    return null;
  }

  static async findById(id) {
    const rows = await query(
      `SELECT id, tracking_id, customer_name, pickup_address, delivery_address,
              pickup_lat, pickup_lon, delivery_lat, delivery_lon,
              status, eta, delivery_partner, assigned_to, created_at, updated_at
       FROM orders WHERE id = ? LIMIT 1`,
      [Number(id)]
    );
    const mapped = mapRowToOrder(rows[0]);
    return mapped ? Object.assign(new Order(mapped), mapped) : null;
  }

  static async findOneAndUpdate(filters = {}, updates = {}) {
    if (filters.trackingId === undefined) {
      return null;
    }

    const current = await Order.findOne({ trackingId: filters.trackingId });
    if (!current) return null;

    const nextStatus = updates.status !== undefined ? updates.status : current.status;
    const nextEta = updates.eta !== undefined ? updates.eta : current.eta;
    const nextAssignedTo = updates.assignedTo !== undefined ? updates.assignedTo : current.assignedTo;
    const nextDeliveryPartner = updates.deliveryPartner !== undefined ? updates.deliveryPartner : current.deliveryPartner;

    await query(
      'UPDATE orders SET status = ?, eta = ?, assigned_to = ?, delivery_partner = ? WHERE id = ?',
      [nextStatus, nextEta, nextAssignedTo, nextDeliveryPartner, current.id]
    );

    return Order.findById(current.id);
  }

  async save() {
    if (this.id) {
      await query(
        `UPDATE orders
         SET tracking_id = ?, customer_name = ?, pickup_address = ?, delivery_address = ?,
             pickup_lat = ?, pickup_lon = ?, delivery_lat = ?, delivery_lon = ?,
             status = ?, eta = ?, delivery_partner = ?, assigned_to = ?
         WHERE id = ?`,
        [
          this.trackingId,
          this.customerName,
          this.pickupAddress,
          this.deliveryAddress,
          this.pickupCoordinates?.lat ?? null,
          this.pickupCoordinates?.lon ?? null,
          this.deliveryCoordinates?.lat ?? null,
          this.deliveryCoordinates?.lon ?? null,
          this.status,
          this.eta,
          this.deliveryPartner,
          this.assignedTo,
          this.id
        ]
      );

      const updated = await Order.findById(this.id);
      Object.assign(this, updated);
      return this;
    }

    const result = await query(
      `INSERT INTO orders (
         tracking_id, customer_name, pickup_address, delivery_address,
         pickup_lat, pickup_lon, delivery_lat, delivery_lon,
         status, eta, delivery_partner, assigned_to
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        this.trackingId,
        this.customerName,
        this.pickupAddress,
        this.deliveryAddress,
        this.pickupCoordinates?.lat ?? null,
        this.pickupCoordinates?.lon ?? null,
        this.deliveryCoordinates?.lat ?? null,
        this.deliveryCoordinates?.lon ?? null,
        this.status,
        this.eta,
        this.deliveryPartner,
        this.assignedTo
      ]
    );

    const inserted = await Order.findById(result.insertId);
    Object.assign(this, inserted);
    return this;
  }
}

module.exports = Order;
