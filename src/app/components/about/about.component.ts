import { Component, inject } from '@angular/core';

import { ScoresService } from '../../providers/services/scores.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrl: './about.component.sass'
})
export class AboutComponent {
  #scoreSvc = inject(ScoresService)

  scores  = this.#scoreSvc.scores
}
