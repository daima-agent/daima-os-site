// Уведомления ОС на телефон (db/36). Только две вещи: принять уведомление и открыть ОС по нажатию.
// Ничего не кэширует и запросы страницы не трогает: загрузка и обновления ОС — как без него.
// Область — папка, откуда он загружен (./): корень сайта или просмотр preview/pr-N/

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()))

self.addEventListener('push', (e) => {
  let d = {}
  try {
    d = e.data ? e.data.json() : {}
  } catch {
    d = { body: e.data ? e.data.text() : '' }
  }
  e.waitUntil(self.registration.showNotification(d.title || 'Даима', {
    body: d.body || '',
    icon: new URL('icon-192.png', self.registration.scope).href,
    lang: 'ru',
    data: { url: d.url || './' },
  }))
})

// Нажатие: открытая ОС этой области выводится вперёд и переходит на вкладку «Тревоги» окна заведения; нет открытой —
// открывается новая. Окна просмотра (preview/…) лежат внутри области корня — их не трогаем
self.addEventListener('notificationclick', (e) => {
  e.notification.close()
  const url = new URL((e.notification.data && e.notification.data.url) || './', self.registration.scope).href
  const home = new URL(self.registration.scope).pathname
  e.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
    const mine = all.find((c) => {
      const p = new URL(c.url).pathname
      return p === home || p === home + 'index.html'
    })
    if (mine) {
      mine.postMessage({ type: 'daima-open', url })
      return mine.focus()
    }
    return self.clients.openWindow(url)
  })())
})
