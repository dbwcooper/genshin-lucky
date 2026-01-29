import { createFileRoute } from '@tanstack/react-router'

import { Route as rootRoute } from './router/__root'
import { Route as IndexImport } from './router/index'
import { Route as KioskImport } from './router/kiosk'

const IndexRoute = IndexImport.update({
  path: '/',
  getParentRoute: () => rootRoute,
} as any)

const KioskRoute = KioskImport.update({
  path: '/kiosk',
  getParentRoute: () => rootRoute,
} as any)

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexImport
      parentRoute: typeof rootRoute
    }
    '/kiosk': {
      id: '/kiosk'
      path: '/kiosk'
      fullPath: '/kiosk'
      preLoaderRoute: typeof KioskImport
      parentRoute: typeof rootRoute
    }
  }
}

export const routeTree = rootRoute.addChildren({ IndexRoute, KioskRoute })
