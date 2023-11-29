import { Injectable, computed, effect, inject, signal } from '@angular/core';

import { ProjectEntity } from '../types';
import { StorageService } from './storage.service';
import { ProjectService } from './api/project.service';

import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  #storageSvc = inject(StorageService)
  #projectSvc = inject(ProjectService)

  #user = signal({} as User);
  user  = computed(() => this.#user());

  // ????
  #user_id = "users:1"
  // ????

  #update_on_storage_ready = effect(() => {
    if (this.#storageSvc.ready()) this.load();
  })

  #update_on_project_ready = effect(() => {
    if (this.#projectSvc.ready()) this.load()
  })

  load() {
    this.#storageSvc.query<User>(ProjectEntity.users, `SELECT * FROM ${this.#user_id} FETCH project`)
      .then(user => {
        this.#user.set(user[0]);
      })
  }
}
