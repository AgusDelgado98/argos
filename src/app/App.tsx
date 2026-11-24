import { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Layout } from './Layout';
import { HomePage } from '../pages/HomePage';
import { CasesHubPage } from '../pages/CasesHubPage';
import { ConceptsPage } from '../pages/ConceptsPage';
import { AboutPage } from '../pages/AboutPage';
import { UpcomingModulesPage } from '../pages/UpcomingModulesPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { ModuleRoute } from './ModuleRoute';

export function AppRoutes() {
  return (
    <Suspense fallback={<div className="container page" role="status">Cargando…</div>}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="casos" element={<CasesHubPage />} />
          <Route path="casos/:slug" element={<ModuleRoute />} />
          <Route path="conceptos" element={<ConceptsPage />} />
          <Route path="acerca" element={<AboutPage />} />
          <Route path="modulos" element={<UpcomingModulesPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
