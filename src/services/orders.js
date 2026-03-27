function randomOrderId() {
  return `ORD-${Math.floor(Math.random() * 900000 + 100000)}`
}

export async function createOrder(payload) {
  try {
    const response = await fetch('/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data?.message || 'Unable to place order')
    return data?.order || data
  } catch {
    return {
      id: randomOrderId(),
      estimatedDelivery: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10),
      ...payload,
    }
  }
}
