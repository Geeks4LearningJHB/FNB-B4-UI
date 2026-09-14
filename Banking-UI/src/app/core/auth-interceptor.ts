import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/environment';

/** Attaches the dev ROLE_USER token as a Bearer header on every /api call. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = environment.devToken;
  if (token && token !== 'PASTE_ROLE_USER_JWT_HERE') {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
  return next(req);
};
