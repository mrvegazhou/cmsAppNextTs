import { createContext } from 'react';
import type TBootstrap from 'bootstrap';

export const AppContext = createContext<{
  bootstrap?: typeof TBootstrap | undefined;
}>({});
