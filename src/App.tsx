import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import { SECTION_IDS } from "./data/sections";

/**
 * Routes are nominal — `AppShell` reads the current hash via
 * `useHashSection` and renders all sections in a slider/scroller.
 * Defining the routes here gives us proper history entries per section
 * and lets `<Navigate>` redirect bogus paths to /home.
 */
export default function App() {
  return (
    <Routes>
      {SECTION_IDS.map((id) => (
        <Route key={id} path={`/${id}`} element={<AppShell />} />
      ))}
      <Route path="/" element={<Navigate to={`/${SECTION_IDS[0]}`} replace />} />
      <Route path="*" element={<Navigate to={`/${SECTION_IDS[0]}`} replace />} />
    </Routes>
  );
}
