import { TrailersActionTypes } from './actions';
import { TrailerStates, TrailerPermissions } from './types';
import createLoadingReducer from '../common/create-loading-reducer';
import { MonitoringCameras, CameraSetting } from '../monitoring/types';

export type TrailerId = string;

export interface Trailer {
  id: TrailerId;
  plateNumber: string;
  name?: string;
  lastLogin?: Date;
  permission: { [key in TrailerPermissions]: boolean };
  position?: google.maps.LatLngLiteral & { date?: string; name?: string; speed?: number; signal?: number };
  driver?: number;
  baseTime?: Date;
  state?: TrailerStates;
  spedition_company?: string;        // ADDED "Display customer name"
  engine_running: boolean;           // ADDED https://www.wrike.com/open.htm?id=445612989
  network_available: boolean;
  cameraSettings: { [key in MonitoringCameras]: CameraSetting };
  [key: string]: any;
}

export interface TrailersState {
  entities: {
    [key: string]: Trailer;
  };
  order: TrailerId[];
  query: string;
  active: TrailerId | null;
  edited: Partial<Trailer> | null;
  loading: boolean;
  error: Error | null;
}

const initialState: TrailersState = {
  entities: {},
  order: [],
  query: '',
  active: null,
  edited: null,
  loading: true,
  error: null,
};

function trailer(state = initialState, action: Action = { type: '' }): TrailersState {
  switch (action.type) {
    case TrailersActionTypes.fetchTrailersSuccess:
      return {
        ...state,
        order: Array.from(new Set([...state.order, ...action.payload.order])),
        entities: Object.entries(action.payload.entities).reduce(
          (entities, [trailerId, trailerData]) => ({
            ...entities,
            [trailerId]: { ...entities[trailerId], ...trailerData },
          }),
          state.entities,
        ),
      };
    case TrailersActionTypes.setTrailerState:
      return {
        ...state,
        entities: {
          ...state.entities,
          [action.payload.id]: {
            ...state.entities[action.payload.id],
            state: action.payload.status,
          },
        },
      };
    case TrailersActionTypes.setTrailerStateSuccess:
      return {
        ...state,
        entities: {
          ...state.entities,
          [action.payload.id]: {
            ...state.entities[action.payload.id],
            ...action.payload.trailer,
          },
        },
      };
    case TrailersActionTypes.setTrailerStateFail:
      return {
        ...state,
        entities: {
          ...state.entities,
          [action.payload.id]: {
            ...state.entities[action.payload.id],
            ...action.payload.trailer,
          },
        },
      };
    case TrailersActionTypes.selectTrailer:
      return {
        ...state,
        active: action.payload.id,
      };
    case TrailersActionTypes.filterTrailers:
      return {
        ...state,
        query: action.payload.query,
      };
    default:
      return state;
  }
}

export default createLoadingReducer(
  trailer,
  TrailersActionTypes.fetchTrailersSent,
  TrailersActionTypes.fetchTrailersSuccess,
  TrailersActionTypes.fetchTrailersFail,
);
