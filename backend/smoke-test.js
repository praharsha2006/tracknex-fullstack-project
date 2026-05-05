/* eslint-disable no-console */
const base = 'http://localhost:5000';

async function request(path, options = {}) {
  const res = await fetch(`${base}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const error = new Error(`${res.status} ${res.statusText}`);
    error.response = data;
    throw error;
  }

  return data;
}

async function maybeRegister(user) {
  try {
    await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(user)
    });
    return 'created';
  } catch (error) {
    return `note: ${error.message}`;
  }
}

async function run() {
  console.log('=== Ping ===');
  const ping = await request('/api/ping');
  console.log('ping =', ping);

  console.log('\n=== Register users ===');
  console.log('manager register =', await maybeRegister({
    username: 'manager_test',
    password: 'Pass@123',
    role: 'manager',
    name: 'Manager Test',
    email: 'manager_test@example.com'
  }));
  console.log('delivery register =', await maybeRegister({
    username: 'delivery_test',
    password: 'Pass@123',
    role: 'delivery',
    name: 'Delivery Test',
    email: 'delivery_test@example.com'
  }));

  console.log('\n=== Login ===');
  const managerLogin = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username: 'manager_test', password: 'Pass@123' })
  });
  const deliveryLogin = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username: 'delivery_test', password: 'Pass@123' })
  });

  const managerToken = managerLogin.token;
  const deliveryToken = deliveryLogin.token;
  console.log('manager token present =', Boolean(managerToken));
  console.log('delivery token present =', Boolean(deliveryToken));

  console.log('\n=== Users ===');
  const deliveryUsers = await request('/api/users/delivery', {
    headers: { Authorization: `Bearer ${managerToken}` }
  });
  const driver = deliveryUsers.find((u) => u.username === 'delivery_test');
  if (!driver) throw new Error('delivery_test user not found in /api/users/delivery');
  console.log('delivery user id =', driver.id);

  console.log('\n=== Orders ===');
  const order = await request('/api/orders', {
    method: 'POST',
    body: JSON.stringify({
      trackingId: `TRK-${Date.now()}`,
      customerName: 'Smoke Customer',
      pickupAddress: 'A',
      deliveryAddress: 'B',
      pickupCoordinates: { lat: 12.9716, lon: 77.5946 },
      deliveryCoordinates: { lat: 12.9352, lon: 77.6245 }
    })
  });
  console.log('order created id =', order.id, 'trackingId =', order.trackingId);

  const assignedOrder = await request('/api/delivery/assign/order', {
    method: 'POST',
    headers: { Authorization: `Bearer ${managerToken}` },
    body: JSON.stringify({ orderId: order.id, deliveryUserId: driver.id })
  });
  console.log('order assigned status =', assignedOrder.order?.status);

  console.log('\n=== Trips ===');
  const trip = await request('/api/trips', {
    method: 'POST',
    headers: { Authorization: `Bearer ${managerToken}` },
    body: JSON.stringify({
      tripId: `trip_smoke_${Date.now()}`,
      driverId: driver.id,
      orderIds: [order.id],
      status: 'assigned'
    })
  });
  console.log('trip created id =', trip.id, 'status =', trip.status);

  const started = await request(`/api/trips/${trip.id}/start`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${managerToken}` }
  });
  console.log('trip started status =', started.status);

  const currentTrip = await request('/api/delivery/current-trip', {
    headers: { Authorization: `Bearer ${deliveryToken}` }
  });
  console.log('delivery current trip id =', currentTrip.id, 'status =', currentTrip.status);

  const ended = await request(`/api/trips/${trip.id}/end`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${managerToken}` }
  });
  console.log('trip ended status =', ended.status);

  const trips = await request('/api/trips', {
    headers: { Authorization: `Bearer ${managerToken}` }
  });
  console.log('total trips count =', Array.isArray(trips) ? trips.length : 0);

  console.log('\nPASS: backend smoke test completed');
}

run().catch((error) => {
  console.error('\nFAIL:', error.message);
  if (error.response) console.error('Response:', error.response);
  process.exit(1);
});
