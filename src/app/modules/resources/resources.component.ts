import { Component, Signal, inject, signal } from '@angular/core';

import { OutcomeService } from '../../providers/services/outcome.service';
import { ContentService } from '../../providers/services/content.service';

import { Resource } from '../../providers/models/resource.model';
import { Paper } from '../../providers/models/paper.model';

@Component({
  selector: 'app-resources',
  templateUrl: './resources.component.html',
  styleUrl: './resources.component.sass'
})
export class ResourcesComponent {
  #outcomeSvc = inject(OutcomeService)
  #contentSvc = inject(ContentService)

  resources: Signal<Resource[]> = this.#contentSvc.resources
  papers:    Signal<Paper[]> = this.#outcomeSvc.papers

  get_resource_type(id: string): string {
    return this.resources().find(r => r.id === id)?.type
  }

  get_resource_title(id: string): string {
    return this.resources().find(r => r.id === id)?.title
  }
}
