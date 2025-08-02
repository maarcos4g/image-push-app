
type SendNotificationOptions = {
  title: string
  body: string
}

export function sendNotification({ title, body }: SendNotificationOptions) {
  new Notification(title, {
    body,
    icon: '../assets/logo@3x.png',
    silent: true,
  })
  const notification = new Audio(new URL('../assets/notification.mp3', import.meta.url).href)
  notification.play()
}