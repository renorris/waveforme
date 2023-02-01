// Waveforme storeHooks.tsx
// Copyright (C) 2023 Reese Norris - All Rights Reserved

import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';

// Export typeified dispatch and selector for our app
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;