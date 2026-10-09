import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
  },
  {
    path: 'book',
    loadComponent: () => import('./pages/book/book').then((m) => m.Book),
  },
  {
    path: 'cameras',
    loadComponent: () => import('./pages/cameras/cameras').then((m) => m.Cameras),
  },
  {
    path: 'cameras/:slug',
    loadComponent: () =>
      import('./pages/camera-detail/camera-detail').then((m) => m.CameraDetail),
  },
  {
    path: 'photographers',
    loadComponent: () =>
      import('./pages/photographers/photographers').then((m) => m.Photographers),
  },
  {
    path: 'photographers/:idOrSlug',
    loadComponent: () =>
      import('./pages/photographer-detail/photographer-detail').then(
        (m) => m.PhotographerDetail,
      ),
  },
  {
    path: 'services',
    loadComponent: () => import('./pages/services/services').then((m) => m.Services),
  },
  {
    path: 'services/:slug',
    loadComponent: () =>
      import('./pages/service-detail/service-detail').then((m) => m.ServiceDetail),
  },
  {
    path: 'how-it-works',
    loadComponent: () =>
      import('./pages/how-it-works/how-it-works').then((m) => m.HowItWorks),
  },
  {
    path: 'pricing',
    loadComponent: () => import('./pages/pricing/pricing').then((m) => m.Pricing),
  },
  {
    path: 'corporate',
    loadComponent: () =>
      import('./pages/corporate/corporate').then((m) => m.Corporate),
  },
  {
    path: 'about',
    loadComponent: () => import('./pages/about/about').then((m) => m.About),
  },
  {
    path: 'contact',
    loadComponent: () => import('./pages/contact/contact').then((m) => m.Contact),
  },
  {
    path: 'privacy',
    loadComponent: () => import('./pages/legal/legal').then((m) => m.Legal),
  },
  {
    path: 'terms',
    loadComponent: () => import('./pages/legal/legal').then((m) => m.Legal),
  },
  {
    path: 'cancellation',
    loadComponent: () => import('./pages/legal/legal').then((m) => m.Legal),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
