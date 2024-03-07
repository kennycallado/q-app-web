import { Component,
  inject,
  effect,
  // signal,
  // ElementRef, HostListener, ViewChild,
  } from '@angular/core'
// import { Router } from '@angular/router'
import { GlobalAuthService } from '../../../../providers/services/global/auth.service'
import { IntervAuthService } from '../../../../providers/services/interventions/auth.service'

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.sass'
})
export class NavigationComponent {
  #globalAuthSvc = inject(GlobalAuthService)
  #intevAuthSvc = inject(IntervAuthService)
  // #router = inject(Router)
  // #eRef     = inject(ElementRef)

  // is_authenticated = signal(false);
  is_authenticated = this.#globalAuthSvc.authenticated()

  update = effect(() => {
    this.is_authenticated = this.#globalAuthSvc.authenticated()
  })

  // detect click outside to close the menu
  // @ViewChild('burger') burger: ElementRef
  // @HostListener('document:click', ['$event.target'])
  // clickout(element: HTMLElement) {
  //   if (!this.#eRef.nativeElement.contains(element)) {
  //     if (this.burger.nativeElement.classList.contains('collapsed')) return ;
  //     this.burger.nativeElement.click()
  //   }
  // }

  logout(): void {
    this.#intevAuthSvc.logout()
    this.#globalAuthSvc.logout()

    location.reload()

    return ;
  }
}
