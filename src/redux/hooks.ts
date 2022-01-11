import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from './store'

/** Use throughout the app instead of plain `useSelector` */ 
export const useAppDispatch = () => useDispatch<AppDispatch>()
/** Use throughout the app instead of plain `useDispatch` */ 
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector