self.addEventListener('sync', function(event) {
  if (event.tag == 'myFirstSync') event.waitUntil(doSomeStuff())
});

function doSomeStuff() {
  self.registration.showNotification("Sync event fired!")
}

