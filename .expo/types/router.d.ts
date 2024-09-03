/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/..\components\BottomNavBar` | `/..\components\TopNavBar` | `/_sitemap` | `/events` | `/forgotpassword` | `/login-signup` | `/match` | `/messages` | `/myevents` | `/profile` | `/profilesettings` | `/search` | `/signup` | `/trending`;
      DynamicRoutes: never;
      DynamicRouteTemplate: never;
    }
  }
}
