import { Component, inject } from '@angular/core';

import { StorageService } from '../../providers/services/storage.service';
import { IntervAuthService } from '../../providers/services/interventions/auth.service';
import { GlobalAuthService } from '../../providers/services/global/auth.service';

import { Question } from '../../providers/models/question.model';
import { Media } from '../../providers/models/media.model';
import { Resource } from '../../providers/models/resource.model';
import { Slide } from '../../providers/models/slide.model';
import { Answer } from '../../providers/models/answer.model';
import { Paper } from '../../providers/models/paper.model';
import { Score } from '../../providers/models/score.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.sass'
})
export class HomeComponent {
  #storageSvc = inject(StorageService)
  #interv_authSvc   = inject(IntervAuthService)
  #global_authSvc   = inject(GlobalAuthService)

  async global_login() {
    console.log(await this.#global_authSvc.global_login("kenny"))

    setTimeout(() => {
      console.log(`globally auth: ${this.#global_authSvc.authenticated()}`)
      }, 500)
  }

  async interv_login() {
    console.log(await this.#interv_authSvc.interv_login("demo", "01HJTEBG4Y1EAXPATENCDCT7WW"))

    setTimeout(() => {
      console.log(`interv auth: ${this.#interv_authSvc.authenticated()}`)
      } , 500)
  }

  async getEso(entity: string) {
    let result: Promise<Array<Question | Media | Resource | Slide>>;
    result = this.#storageSvc.query_interv(`SELECT * FROM ${entity};`)

    console.log(await result)
  }

  async getEsto(entity: string) {
    let result: Promise<Array<Answer | Paper | Score>>
    result = this.#storageSvc.query_interv(`SELECT * FROM ${entity};`)

    console.log(await result)
  }
}
