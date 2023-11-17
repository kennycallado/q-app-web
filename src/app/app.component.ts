import { Component, inject } from '@angular/core';
import { SwPush, SwUpdate, VersionEvent } from '@angular/service-worker';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent {
  #swUpdate   = inject(SwUpdate)
  #swPush     = inject(SwPush)

  title = 'q_app-web';

  ngOnInit() {
    if (this.#swPush.isEnabled) {
      // this.#webpushSvc.listen()
    }

    if (this.#swUpdate.isEnabled) {
      this.#swUpdate.versionUpdates.subscribe((event: VersionEvent) => {
        if (event.type === 'VERSION_READY') {
          if(confirm("New version available. Load New Version?")) window.location.reload()
        }
      })
    }
  }
}
