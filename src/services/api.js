// Client API service with real-time SSE stream & resilient offline fallback

const API_BASE = '/api';

export async function fetchOrdersFromApi() {
  try {
    const res = await fetch(`${API_BASE}/orders`);
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('API offline, using cached orders:', err.message);
  }
  return null;
}

export async function createOrderApi(orderData) {
  try {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('API offline, saving locally:', err.message);
  }
  return null;
}

export async function updateOrderStatusApi(orderId, status, extraFields = {}) {
  try {
    const res = await fetch(`${API_BASE}/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, ...extraFields })
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('API offline, updating locally:', err.message);
  }
  return null;
}

export async function cancelOrderApi(orderId) {
  try {
    const res = await fetch(`${API_BASE}/orders/${orderId}`, {
      method: 'DELETE'
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('API offline, deleting locally:', err.message);
  }
  return null;
}

export async function toggleItemStockApi(itemId) {
  try {
    const res = await fetch(`${API_BASE}/stock/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId })
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('API offline:', err.message);
  }
  return null;
}

export async function addCouponApi(coupon) {
  try {
    const res = await fetch(`${API_BASE}/coupons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(coupon)
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('API offline:', err.message);
  }
  return null;
}

export async function fetchRiderLocationsApi() {
  try {
    const res = await fetch(`${API_BASE}/riders/locations`);
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('API offline:', err.message);
  }
  return {};
}

export async function updateRiderLocationApi(locationData) {
  try {
    const res = await fetch(`${API_BASE}/riders/location`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(locationData)
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('API offline:', err.message);
  }
  return null;
}

export async function fetchSettingsApi() {
  try {
    const res = await fetch(`${API_BASE}/settings`);
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('API offline:', err.message);
  }
  return { merchantUpi: '8248651695-3@ybl', merchantName: 'Unavukadai Express' };
}

export async function updateSettingsApi(settings) {
  try {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('API offline:', err.message);
  }
  return settings;
}

export async function resetOrdersApi() {
  try {
    const res = await fetch(`${API_BASE}/orders/reset`, {
      method: 'POST'
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('API offline:', err.message);
  }
  return null;
}

// Subscribe to real-time Server-Sent Events stream for instant cross-device updates
export function subscribeToLiveUpdates(onUpdate) {
  if (typeof window === 'undefined' || !window.EventSource) return () => {};

  let eventSource = null;
  try {
    eventSource = new EventSource(`${API_BASE}/orders/stream`);

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        onUpdate(payload);
      } catch (e) {
        console.error('Failed to parse SSE payload', e);
      }
    };

    eventSource.onerror = () => {
      // EventSource automatically reconnects on error
    };
  } catch (err) {
    console.warn('SSE subscription failed, fallback to local state', err);
  }

  return () => {
    if (eventSource) {
      eventSource.close();
    }
  };
}
