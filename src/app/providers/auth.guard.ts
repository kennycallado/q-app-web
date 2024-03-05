import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { GlobalAuthService } from './services/global/auth.service';
import { IntervAuthService } from './services/interventions/auth.service';

export const GlobalAuthGuard: CanActivateFn = (route, state) => {
  const router = inject(Router)
  const auth   = inject(GlobalAuthService)

  if (auth.authenticated()) return true

  router.navigate(['/login'], { queryParams: { returnUrl: state.url } })
  return false
}

export const IntervAuthGuard: CanActivateFn = (route, state) => {
  const router = inject(Router)
  const auth   = inject(IntervAuthService)

  if (auth.authenticated()) return true

  router.navigate(['/home'], { queryParams: { returnUrl: state.url } })
  return false;
};
