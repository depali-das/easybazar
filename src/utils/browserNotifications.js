export function getBrowserNotificationSupport() {
  if (!('Notification' in window)) return 'unsupported'
  if (!window.isSecureContext) return 'insecure'
  return Notification.permission
}

export async function requestBrowserNotificationPermission() {
  const support = getBrowserNotificationSupport()
  if (support === 'unsupported' || support === 'insecure') return support
  if (Notification.permission === 'granted') return 'granted'
  if (Notification.permission === 'denied') return 'denied'
  return Notification.requestPermission()
}

export function showBrowserNotification(notification, onClick) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return
  try {
    const browserNotification = new Notification(notification.title, {
      body: notification.message,
      tag: notification.id,
    })
    browserNotification.onclick = () => {
      window.focus()
      onClick()
      browserNotification.close()
    }
  } catch (error) {
    console.error('Unable to display browser notification:', error)
  }
}
