import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { GlobalAuthService } from './services/global/auth.service';
import { IntervAuthService } from './services/interventions/auth.service';

export const GlobalAuthGuard: CanActivateFn = (route, state) => {
  const auth   = inject(GlobalAuthService)
  const router = inject(Router)

  if (auth.authenticated()) return true

  router.navigate(['/login'], { queryParams: { returnUrl: state.url } })
  return false
}

export const IntervAuthGuard: CanActivateFn = (route, state) => {
  const auth   = inject(IntervAuthService)
  const router = inject(Router)

  if (auth.authenticated()) return true

  router.navigate(['/join'], { queryParams: { returnUrl: state.url } })
  return false;
};
