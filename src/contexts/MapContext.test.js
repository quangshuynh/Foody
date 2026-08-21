import { act, renderHook } from '@testing-library/react';
import { MapProvider, useMap } from './MapContext';

test('focuses a selected restaurant location', () => {
  const { result } = renderHook(() => useMap(), { wrapper: MapProvider });

  act(() => result.current.focusLocation({ lat: 43.1, lng: -77.6 }));

  expect(result.current.selectedLocation).toEqual({ lat: 43.1, lng: -77.6 });
  expect(result.current.focusId).toBe(1);
});

test('increments focus id when the same location is selected again', () => {
  const { result } = renderHook(() => useMap(), { wrapper: MapProvider });
  const location = { lat: 43.1, lng: -77.6 };

  act(() => result.current.focusLocation(location));
  act(() => result.current.focusLocation(location));

  expect(result.current.focusId).toBe(2);
});
