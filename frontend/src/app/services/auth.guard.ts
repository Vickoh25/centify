import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if user is authenticated (has both stored user and token)
  if (!authService.isAuthenticated()) {
    // Check if there's a stored user (from an unverified login)
    const user = authService.currentUser();
    if (user && route.routeConfig?.path === 'verify-email') {
      // Allow unverified users to access the verify-email page
      return true;
    }
    return router.createUrlTree(['/login']);
  }

  const user = authService.currentUser();
  if (user && !user.emailVerified) {
    // Redirect unverified users to verify-email (but not if they're already there)
    if (route.routeConfig?.path === 'verify-email') {
      return true;
    }
    return router.createUrlTree(['/verify-email']);
  }

  return true;
};

export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    // Allow access if there's an unverified user stored (they came from login)
    const user = authService.currentUser();
    if (user && !user.emailVerified) {
      return router.createUrlTree(['/verify-email']);
    }
    return true;
  }

  return router.createUrlTree(['/dashboard']);
};
