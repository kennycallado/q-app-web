import { Component, inject } from '@angular/core';

import { PapersService } from '../../providers/services/papers.service';

// import { OutcomeService } from '../../providers/services/outcome.service';
// import { ContentService } from '../../providers/services/content.service';

@Component({
  selector: 'app-resources',
  templateUrl: './resources.component.html',
  styleUrl: './resources.component.sass'
})
export class ResourcesComponent {
  #papersSvc = inject(PapersService)

  papers = this.#papersSvc.papers

  ngAfterViewInit() {
    this.#papersSvc.load()
  }

  // <!-- maybe a popup that is syncing -->

  // #outer_db_ready = signal(false)
  // outer_db_ready = computed(() => this.#outer_db_ready())

  // #outer_db_update = effect(() => {
  //   if (this.#outcomeSvc.ready() && this.#contentSvc.ready()) this.#outer_db_ready.set(true)
  // }, { allowSignalWrites: true})
}
