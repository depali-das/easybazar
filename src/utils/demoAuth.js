const USERS_KEY = 'easybazar-demo-users'
const SESSION_KEY = 'easybazar-demo-session'

function getCustomerId(email) {
  let hash = 2166136261
  for (const character of email) {
    hash ^= character.charCodeAt(0)
    hash = Math.imul(hash, 16777619)
  }
  return `demo-${(hash >>> 0).toString(36)}`
}

function createCustomerId() {
  return globalThis.crypto?.randomUUID?.() || `demo-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function readUsers() {
  const savedUsers = localStorage.getItem(USERS_KEY)
  if (!savedUsers) return []

  const users = JSON.parse(savedUsers)
  if (!Array.isArray(users)) {
    throw new Error('Saved demo accounts are invalid. Clear this browser storage and try again.')
  }

  return users
}

function createSalt() {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

async function hashPassword(password, salt) {
  if (!crypto.subtle) {
    throw new Error('Secure browser cryptography is unavailable in this context.')
  }

  const encoded = new TextEncoder().encode(`${salt}:${password}`)
  const digest = await crypto.subtle.digest('SHA-256', encoded)
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('')
}

export async function registerDemoAccount({ name, email, password }) {
  const normalizedEmail = email.trim().toLowerCase()
  const users = readUsers()

  if (users.some((user) => user.email === normalizedEmail)) {
    throw new Error('An account with this email already exists. Please log in.')
  }

  const salt = createSalt()
  const passwordHash = await hashPassword(password, salt)
  const account = { name: name.trim(), email: normalizedEmail, customerId: createCustomerId() }

  localStorage.setItem(
    USERS_KEY,
    JSON.stringify([...users, { ...account, salt, passwordHash }]),
  )
  localStorage.setItem(SESSION_KEY, JSON.stringify(account))
  return account
}

export async function loginDemoAccount({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase()
  const user = readUsers().find((savedUser) => savedUser.email === normalizedEmail)

  if (!user || (await hashPassword(password, user.salt)) !== user.passwordHash) {
    throw new Error('Email or password is incorrect.')
  }

  const account = {
    name: user.name,
    email: user.email,
    customerId: user.customerId || getCustomerId(user.email),
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(account))
  return account
}

export function getDemoSession() {
  try {
    const savedSession = localStorage.getItem(SESSION_KEY)
    if (!savedSession) return null

    const session = JSON.parse(savedSession)
    if (
      !session ||
      typeof session.name !== 'string' ||
      typeof session.email !== 'string'
    ) {
      throw new Error('Saved demo session is invalid. Please log in again.')
    }

    return {
      ...session,
      customerId: session.customerId || getCustomerId(session.email.toLowerCase()),
    }
  } catch (error) {
    console.error('Unable to load demo account session:', error)
    try {
      localStorage.removeItem(SESSION_KEY)
    } catch (storageError) {
      console.error('Unable to clear invalid demo account session:', storageError)
    }
    return null
  }
}

export function logoutDemoAccount() {
  localStorage.removeItem(SESSION_KEY)
}
