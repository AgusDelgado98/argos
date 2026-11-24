import { Navigate, useParams } from 'react-router-dom';
import { getModule } from '../modules/registry/registry';
import { NotFoundPage } from '../pages/NotFoundPage';

/** Resuelve /casos/:slug contra el registro de módulos. */
export function ModuleRoute() {
  const { slug = '' } = useParams();
  const mod = getModule(slug);
  if (!mod) return <NotFoundPage />;
  if (mod.status !== 'available' || !mod.component) {
    return <Navigate to={`/modulos#${mod.id}`} replace />;
  }
  const View = mod.component;
  return <View />;
}
