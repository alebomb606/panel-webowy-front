import moment from 'moment';
import {MonitoringActionTypes} from './actions';
import {MediaId, MonitoringCamera, MonitoringCameras} from './types';
import {TrailerId} from '../trailers/reducer';

export interface MonitoringState {
  media: { [key in MediaId]?: MonitoringCamera };
  trailerVideos: { [key in TrailerId]: { [camera in MonitoringCameras]: MediaId[] } };
  trailerImages: { [key in TrailerId]: { [camera in MonitoringCameras]: MediaId[] } };
  ui: {
    time: string;
    camera?: MonitoringCameras;
    isNow: boolean;
  };
  error: boolean;
}

const initialState: MonitoringState = {
  media: {},
  trailerImages: {},
  trailerVideos: {},
  ui: {
    time: moment()
      .startOf('minute')
      .toISOString(),
    camera: MonitoringCameras.interior,
    isNow: true,
  },
  error: false,
};

function monitoring(state = initialState, action: Action = { type: '' }): MonitoringState {
  switch (action.type) {
    case MonitoringActionTypes.fetchMediaFail:
      return {
        ...state,
        error: true,
        ui: {...state.ui, camera: action.payload.media.type },

      };
     case MonitoringActionTypes.process:

      return {
        ...state,
        process: action.payload,
      };
    case MonitoringActionTypes.fetchMediaSuccess:
      return {
        ...state,
        media: { ...state.media, ...action.payload.media },
        trailerImages: { ...state.trailerImages, ...action.payload.trailerImages },
        trailerVideos: { ...state.trailerVideos, ...action.payload.trailerVideos },
      };
    case MonitoringActionTypes.selectCamera:
      return {
        ...state,
        ui: { ...state.ui, camera: action.payload.camera },
      };
    case MonitoringActionTypes.selectTime:
      return {
        ...state,
        ui: { ...state.ui, time: action.payload.time, isNow: action.payload.isNow },
      };
    case MonitoringActionTypes.requestMediaFail:
      return {
        ...state,
        error: true,
        ui: {...state.ui, camera: action.payload.media.type },
      };
    case MonitoringActionTypes.requestMediaSuccess: {
      const media = action.payload.media;
      if (!MonitoringCameras.isMonitoringCamera(media.type)) return state;
      const type: MonitoringCameras = media.type;
      const bucket = media.type === 'video' ? state.trailerVideos : state.trailerImages;
      const bucketName = media.type === 'video' ? 'trailerVideos' : 'trailerImages';
      const bucketForTrailer = bucket[media.trailerId] || {};
      const order = Array.from(new Set([media.id, ...(bucketForTrailer[type] || [])]));
      return {
        ...state,
        media: { ...state.media, [action.payload.media.id]: action.payload.media },
        [bucketName]: {
          ...bucket,
          [media.trailerId]: {
            ...bucketForTrailer,
            [media.type]: order,
          },
        },
      };
    }
    default:
      return state;
  }
}

export default monitoring;
