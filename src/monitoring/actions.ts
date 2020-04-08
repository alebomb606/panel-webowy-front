import { ThunkDispatch } from 'redux-thunk';
import moment from 'moment';

import api, { MediaRequestQuery, MediaListRequestQuery } from '../api';
import { MonitoringCameras, MediaId, MonitoringCamera } from './types';
import { MonitoringState } from './reducer';
import { State } from '../store';
import { TrailerId } from '../trailers/reducer';
import { TrailerStates } from '../trailers/types';

export enum MonitoringActionTypes {
  fetchMediaSent = 'MonitoringActionTypes.fetchMediaSent',
  fetchMediaSuccess = 'MonitoringActionTypes.fetchMediaSuccess',
  fetchMediaFail = 'MonitoringActionTypes.fetchMediaFail',
  requestMediaSent = 'MonitoringActionTypes.requestMediaSent',
  requestMediaSuccess = 'MonitoringActionTypes.requestMediaSuccess',
  requestMediaFail = 'MonitoringActionTypes.requestMediaFail',
  process = 'MonitoringActionTypes.process',
  selectCamera = 'MonitoringActionTypes.selectCamera',
  selectTime = 'MonitoringActionTypes.selectTime',
}

export function selectCamera(camera: MonitoringCameras) {
  return {
    type: MonitoringActionTypes.selectCamera,
    payload: { camera },
  };
}

export function selectTime(time: string, isNow: boolean = false) {
  return {
    type: MonitoringActionTypes.selectTime,
    payload: { time, isNow },
  };
}


export function fetchMedia(id: TrailerId) {
  return async (dispatch: ThunkDispatch<State, {}, Action>, getState: () => State) => {
    dispatch({ type: MonitoringActionTypes.fetchMediaSent });
    try {
      const { auth, monitoring } = getState();
      const time = monitoring.ui.isNow ? moment() : moment(monitoring.ui.time);
      const query: MediaListRequestQuery = {
        from: time.startOf('day').toDate(),
        to: time.endOf('day').toDate(),
      };
      const { data } = await api.fetchMedia({ id, query, auth });
      const payload = data.reduce(handleMediaFromApi, {
        media: {},
        trailerImages: {},
        trailerVideos: {},
      });
      dispatch({
        type: MonitoringActionTypes.fetchMediaSuccess,
        payload: {
          media: payload.media,
          trailerImages: { [id]: payload.trailerImages },
          trailerVideos: { [id]: payload.trailerVideos },
        },
      });
      if(data){
        dispatch({ type: MonitoringActionTypes.process, payload:true });
      }

    } catch (error) {

      dispatch({ type: MonitoringActionTypes.fetchMediaFail, error: true, payload: { error } });
    }
  };
}


export function requestMedia(id: TrailerId, query: MediaRequestQuery) {
  return async (dispatch: ThunkDispatch<State, {}, Action>, getState: () => State) => {
    dispatch({ type: MonitoringActionTypes.requestMediaSent });

    try {
      const { auth } = getState();
      const { data } = await api.requestMedia({ id, query, auth });
      // Responses might show incorrect data, let's fix it as a workaround
      const media = { ...mapRawMedia(data), trailerId: id, type: query.camera };

      dispatch({ type: MonitoringActionTypes.requestMediaSuccess, payload: { media } });
      setTimeout(async () => dispatch(await fetchMedia(id)), 1);
    } catch (error) {
      const media = { type: query.camera };
      dispatch({ type: MonitoringActionTypes.requestMediaFail, error: true, payload: { error, media } });
    }
  };
}

type Accumulator = {
  media: MonitoringState['media'];
  trailerImages: { [camera in MonitoringCameras]: MediaId[] };
  trailerVideos: { [camera in MonitoringCameras]: MediaId[] };
};

export const mapRawMedia = (media: any): MonitoringCamera => {
  return {
    id: media.id,
    trailerId: media.trailer !== undefined ? media.trailer.id : null,
    type: MonitoringCameras.fromApi(media.camera),
    mediaType: media.kind === 'video' ? 'video' : 'image',
    alarm: media.trailer_event ? TrailerStates.from(media.trailer_event.kind) === TrailerStates.alarm : false,
    downloadDate: new Date(media.requested_at).toISOString(),
    eventDate: new Date(media.requested_time).toISOString(),
    isLoading: media.status !== 'completed',
    snapshotUrl: media.url,
    logistician: media.logistician
      ? {
          firstName: media.logistician.first_name,
          id: media.logistician.id,
          lastName: media.logistician.last_name,
          phoneNumber: media.logistician.phone_number,
        }
      : undefined,
  };
};

const handleMediaFromApi = (accumulator: Accumulator, current: any): Accumulator => {
  const { media, trailerImages, trailerVideos } = accumulator;
  const bucket = current.kind === 'video' ? trailerVideos : trailerImages;
  const bucketName = current.kind === 'video' ? 'trailerVideos' : 'trailerImages';

  return {
    ...accumulator,
    media: {
      [current.id]: mapRawMedia(current),
      ...media,
    },
    [bucketName]: {
      ...bucket,
      [MonitoringCameras.fromApi(current.camera)]: [
        current.id,
        ...(bucket[MonitoringCameras.fromApi(current.camera)] || []),
      ],
    },
  };
};
