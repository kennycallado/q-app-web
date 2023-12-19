import { Component, inject } from '@angular/core';

import { UserService } from '../../providers/services/user.service';
import { ScoresService } from '../../providers/services/scores.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrl: './about.component.sass'
})
export class AboutComponent {
  #userSvc  = inject(UserService)
  #scoreSvc = inject(ScoresService)

  user    = this.#userSvc.user
  scores  = this.#scoreSvc.scores

  get_score(): Object[] {
    return this.scores().map(score => score.score)
  }
}
