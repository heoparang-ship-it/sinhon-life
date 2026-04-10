const CACHE_NAME = 'sinhon-v2'

self.addEventListener('install', (event) => {
  // 새 SW 설치 즉시 활성화 (대기 없이)
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  // 이전 버전 캐시 모두 삭제
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    ).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return

  // HTML 페이지 요청 → 항상 Network First
  if (event.request.mode === 'navigate' || event.request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
          return response
        })
        .catch(() => caches.match(event.request).then((r) => r || caches.match('/')))
    )
    return
  }

  // 정적 리소스 (JS, CSS, 이미지) → Stale While Revalidate
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const networkFetch = fetch(event.request).then((response) => {
        if (response.status === 200) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
        }
        return response
      })
      return cached || networkFetch
    })
  )
})
