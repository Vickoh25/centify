import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const token = localStorage.getItem('centify_token');
  // Don't add token to auth requests or email verification requests
  const excludedPaths = ['/api/users/login', '/api/users/register', '/api/users/verify-email/by-email', '/api/users/resend-otp/by-email'];
  const isExcluded = excludedPaths.some(path => request.url.includes(path));

  if (!token || isExcluded) {
    return next(request);
  }

  return next(request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  }));
};
