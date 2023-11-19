import { Component, Signal, WritableSignal, computed, effect, inject, signal } from '@angular/core';

import { PapersService } from '../../providers/services/papers.service';

import { Resource } from '../../providers/models/resource.model';

@Component({
  selector: 'app-resources',
  templateUrl: './resources.component.html',
  styleUrl: './resources.component.sass'
})
export class ResourcesComponent {
  #papersSvc    = inject(PapersService)

  papers = this.#papersSvc.papers
}
