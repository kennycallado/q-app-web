import { Component, inject } from '@angular/core';

import { StorageService } from '../../providers/services/storage.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.sass'
})
export class HomeComponent {
  #storageSvc = inject(StorageService)

  async getEso(entity: string) {
    let result = this.#storageSvc.query('interventions', `SELECT * FROM ${entity};`)

    console.log((await result)[0])
  }
}
