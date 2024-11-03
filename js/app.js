if('serviceWorker' in navigator){
    navigator.serviceWorker.register('/sw.js')
        .then((reg) => console.log('service worker registered'))
        .catch((err) => console.group('service worker not registered'));
}