import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './app/App';
import { ProgressProvider } from './lib/progress/context';
import './styles/global.css';
import './styles/layout.css';
import './styles/home.css';
import './styles/simulator.css';
import './styles/pages.css';

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <BrowserRouter>
      <ProgressProvider>
        <AppRoutes />
      </ProgressProvider>
    </BrowserRouter>
  </StrictMode>,
);
