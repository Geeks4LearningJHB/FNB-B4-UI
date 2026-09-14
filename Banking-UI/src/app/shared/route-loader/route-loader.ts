import { Component, OnDestroy, inject, signal } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';
import { Subscription } from 'rxjs';

/** Full-screen loader shown while a route navigation is in progress.
 *  Stays up for a MINIMUM of 5s (so it's a clear, deliberate loading moment
 *  rather than a flash — these lazy chunks load in well under a second) but
 *  will keep holding beyond that if the navigation itself is still running,
 *  so it always genuinely reflects the loading state. A safety timeout
 *  prevents it getting stuck forever if the router never reports completion. */
@Component({
  selector: 'app-route-loader',
  standalone: true,
  templateUrl: './route-loader.html',
  styleUrl: './route-loader.scss',
})
export class RouteLoader implements OnDestroy {
  private router = inject(Router);

  private static readonly MIN_DURATION_MS = 5000;
  private static readonly SAFETY_MAX_MS = 15000;

  visible = signal(false);
  private navStartedAt = 0;
  private navDone = false;
  private minTimer?: ReturnType<typeof setTimeout>;
  private safetyTimer?: ReturnType<typeof setTimeout>;
  private sub: Subscription;

  constructor() {
    this.sub = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.navDone = false;
        this.navStartedAt = Date.now();
        this.visible.set(true);

        clearTimeout(this.minTimer);
        clearTimeout(this.safetyTimer);
        this.minTimer = setTimeout(() => this.tryHide(), RouteLoader.MIN_DURATION_MS);
        this.safetyTimer = setTimeout(() => this.visible.set(false), RouteLoader.SAFETY_MAX_MS);
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        this.navDone = true;
        this.tryHide();
      }
    });
  }

  private tryHide(): void {
    const elapsed = Date.now() - this.navStartedAt;
    if (this.navDone && elapsed >= RouteLoader.MIN_DURATION_MS) {
      this.visible.set(false);
      clearTimeout(this.minTimer);
      clearTimeout(this.safetyTimer);
    }
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    clearTimeout(this.minTimer);
    clearTimeout(this.safetyTimer);
  }
}
