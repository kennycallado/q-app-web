import { Component, ElementRef, HostListener, ViewChild, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.sass'
})
export class NavigationComponent {
  #router   = inject(Router)
  #eRef     = inject(ElementRef)

  is_authenticated = signal(false);

  // detect click outside to close the menu
  @ViewChild('burger') burger: ElementRef
  @HostListener('document:click', ['$event.target'])
  clickout(element: HTMLElement) {
    if (!this.#eRef.nativeElement.contains(element)) {
      if (this.burger.nativeElement.classList.contains('collapsed')) return ;
      this.burger.nativeElement.click()
    }
  }

  logout(): void {
    // this.#authSvc.logout();
    this.#router.navigate(['/login']);

    return ;
  }
}
