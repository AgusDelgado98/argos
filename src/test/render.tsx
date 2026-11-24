import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from '../app/App';
import { ProgressProvider } from '../lib/progress/context';
import { createProgressStore, type ProgressStore } from '../lib/progress/store';
import { createMemoryStorage, type KeyValueStorage } from '../lib/storage';

export function renderApp(path = '/', storage: KeyValueStorage = createMemoryStorage(), store?: ProgressStore) {
  const progressStore = store ?? createProgressStore(storage);
  const user = userEvent.setup();
  const utils = render(
    <MemoryRouter initialEntries={[path]}>
      <ProgressProvider store={progressStore}>
        <AppRoutes />
      </ProgressProvider>
    </MemoryRouter>,
  );
  return { ...utils, user, storage, store: progressStore };
}
