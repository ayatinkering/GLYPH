import { create } from "zustand";
import { SkyState } from "@/engine/sky/SkyEngine";

interface WalkHistory {
  cadence: number[];
  acceleration: number[];
  smoothness: number[];
  entropy: number[];
  rotation: number[];
}

interface WalkStoreState {
  isWalking: boolean;
  footfalls: number;
  cadence: number;
  smoothness: number;
  entropy: number;
  rotation: number;
  duration: number;
  startTime: number | null;
  lat: number | null;
  lng: number | null;
  skyState: SkyState | null;
  weather: { temp: number; code: number } | null;
  isPermitted: boolean;
  history: WalkHistory;

  // Actions
  setPermitted: (permitted: boolean) => void;
  setCoordinates: (lat: number, lng: number) => void;
  setSkyState: (skyState: SkyState) => void;
  setWeather: (temp: number, code: number) => void;
  startWalk: () => void;
  addStep: (cadence: number, acceleration: number, smoothness: number, entropy: number) => void;
  updateRotation: (headingRad: number) => void;
  updateDuration: (seconds: number) => void;
  endWalk: () => void;
  resetStore: () => void;
}

export const useWalkStore = create<WalkStoreState>((set) => ({
  isWalking: false,
  footfalls: 0,
  cadence: 0,
  smoothness: 1.0,
  entropy: 0.0,
  rotation: 0,
  duration: 0,
  startTime: null,
  lat: null,
  lng: null,
  skyState: null,
  weather: null,
  isPermitted: false,
  history: {
    cadence: [],
    acceleration: [],
    smoothness: [],
    entropy: [],
    rotation: [],
  },

  setPermitted: (permitted) => set({ isPermitted: permitted }),
  
  setCoordinates: (lat, lng) => set({ lat, lng }),
  
  setSkyState: (skyState) => set({ skyState }),

  setWeather: (temp, code) => set({ weather: { temp, code } }),

  startWalk: () =>
    set({
      isWalking: true,
      footfalls: 0,
      cadence: 0,
      smoothness: 1.0,
      entropy: 0.0,
      rotation: 0,
      duration: 0,
      startTime: Date.now(),
      weather: null,
      history: {
        cadence: [],
        acceleration: [],
        smoothness: [],
        entropy: [],
        rotation: [],
      },
    }),

  addStep: (cadence, acceleration, smoothness, entropy) =>
    set((state) => {
      const newFootfalls = state.footfalls + 1;
      return {
        footfalls: newFootfalls,
        cadence,
        smoothness,
        entropy,
        history: {
          cadence: [...state.history.cadence, cadence],
          acceleration: [...state.history.acceleration, acceleration],
          smoothness: [...state.history.smoothness, smoothness],
          entropy: [...state.history.entropy, entropy],
          rotation: [...state.history.rotation, state.rotation],
        },
      };
    }),

  updateRotation: (headingRad) =>
    set((state) => ({
      rotation: headingRad,
      // Continuously record rotation heading over time
      history: {
        ...state.history,
        rotation: state.isWalking 
          ? [...state.history.rotation, headingRad] 
          : state.history.rotation,
      },
    })),

  updateDuration: (seconds) => set({ duration: seconds }),

  endWalk: () => set({ isWalking: false }),

  resetStore: () =>
    set({
      isWalking: false,
      footfalls: 0,
      cadence: 0,
      smoothness: 1.0,
      entropy: 0.0,
      rotation: 0,
      duration: 0,
      startTime: null,
      skyState: null,
      weather: null,
      history: {
        cadence: [],
        acceleration: [],
        smoothness: [],
        entropy: [],
        rotation: [],
      },
    }),
}));
