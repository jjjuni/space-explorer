import { create } from "zustand";
import type { PlanetConfig } from "../constants/planets";

interface SpaceState {
  nearbyPlanet: PlanetConfig | null;
  focusedPlanet: PlanetConfig | null;

  setNearbyPlanet: (planet: PlanetConfig | null) => void;

  setFocusedPlanet: (planet: PlanetConfig | null) => void;
}

export const useSpaceStore = create<SpaceState>((set) => ({
  nearbyPlanet: null,
  focusedPlanet: null,

  setNearbyPlanet: (planet) => set({ nearbyPlanet: planet }),

  setFocusedPlanet: (planet) => set({ focusedPlanet: planet }),
}));
