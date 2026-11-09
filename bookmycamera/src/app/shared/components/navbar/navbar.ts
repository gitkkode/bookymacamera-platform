import {
  Component,
  DestroyRef,
  HostListener,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';

interface NavLink {
  label: string;
  path: string;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
  host: { '[class.is-overlay]': 'overlay()' },
})
export class Navbar implements OnInit {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly menuOpen = signal(false);
  readonly scrolled = signal(false);
  /** Home page: nav floats over the full-height hero instead of taking space. */
  readonly overlay = signal(false);

  readonly links: NavLink[] = [
    { label: 'Home', path: '/' },
    { label: 'Book', path: '/book' },
    { label: 'Gear', path: '/cameras' },
    { label: 'Photographers', path: '/photographers' },
    { label: 'Services', path: '/services' },
    { label: 'Pricing', path: '/pricing' },
    { label: 'How it works', path: '/how-it-works' },
  ];

  ngOnInit(): void {
    this.updateScrollState();
    this.updateOverlay(this.router.url);
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event) => {
        this.updateOverlay(event.urlAfterRedirects);
        this.closeMenu();
      });
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.updateScrollState();
  }

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
    this.syncBodyScroll();
  }

  closeMenu(): void {
    if (!this.menuOpen()) return;
    this.menuOpen.set(false);
    this.syncBodyScroll();
  }

  private updateOverlay(url: string): void {
    const path = url.split(/[?#]/)[0];
    this.overlay.set(path === '/' || path === '');
  }

  private updateScrollState(): void {
    this.scrolled.set(window.scrollY > 16);
  }

  private syncBodyScroll(): void {
    document.body.style.overflow = this.menuOpen() ? 'hidden' : '';
  }
}
