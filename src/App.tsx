import { AppRouter } from "@/router/AppRouter";

/**
 * Top-level app shell.
 *
 * Previously this component wrapped the whole tree in a Google Maps
 * `<LoadScript>` (via `MapProvider`), which:
 *   1. Forced every page — even pages that don't use maps — to wait
 *      for the Google Maps JS API to finish loading.
 *   2. Loaded the legacy Maps JS API globally, which then collided
 *      with the new `<APIProvider>` used by the `/map-gl` page and
 *      produced the "Element with name 'gmp-*' already defined"
 *      console errors and a permanently blank screen.
 *   3. Blocked rendering of the entire router when the API key was
 *      missing or the script failed to fire `onLoad`.
 *
 * Each map page now loads its own Google Maps script locally
 * (`/map` uses `<LoadScript>`, `/map-gl` uses `<APIProvider>`), so
 * the app shell renders immediately regardless of Maps availability.
 */
const App = () => {
    return <AppRouter />;
};

export default App;
