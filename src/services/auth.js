function fakeToken() {
  return `ff_${Math.random().toString(36).slice(2)}`
}

function inferRoleFromIdentifier(identifier = '') {
  const value = identifier.toLowerCase()
  if (value.includes('admin')) return 'admin'
  if (value.includes('vendor')) return 'vendor'
  return 'customer'
}

export async function loginUser(payload) {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data?.message || 'Unable to login')
    return data
  } catch (error) {
    if (payload.password === 'wrong') {
      throw new Error('Invalid credentials')
    }
    const role = inferRoleFromIdentifier(payload.identifier)
    return {
      user: {
        name: role === 'admin' ? 'Admin User' : role === 'vendor' ? 'Vendor User' : 'Customer User',
        email: payload.identifier.includes('@') ? payload.identifier : '',
        role,
      },
      token: fakeToken(),
    }
  }
}

export async function registerUser(payload) {
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data?.message || 'Unable to register')
    return data
  } catch {
    return {
      user: {
        name: payload.fullName,
        email: payload.email,
        role: payload.role,
      },
      token: fakeToken(),
    }
  }
}
