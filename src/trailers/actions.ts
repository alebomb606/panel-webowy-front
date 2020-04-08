import { Dispatch } from 'redux';

import api from '../api';
import { State } from '../store';
import { TrailerId, Trailer } from './reducer';
import { TrailerStates } from './types';
import { fetchEvents, TrailerEventsActionTypes, mapInteraction } from '../events/actions';
import { ThunkDispatch } from 'redux-thunk';
import { TrailerEventId, TrailerEvent } from '../events/reducer';
import { MonitoringCameras } from '../monitoring/types';

export enum TrailersActionTypes {
  selectTrailer = 'TrailersActionTypes.selectTrailer',
  filterTrailers = 'TrailersActionTypes.filterTrailers',
  fetchTrailersSent = 'TrailersActionTypes.fetchTrailersSent',
  fetchTrailersSuccess = 'TrailersActionTypes.fetchTrailersSuccess',
  fetchTrailersFail = 'TrailersActionTypes.fetchTrailersFail ',
  setTrailerState = 'TrailersActionTypes.setTrailerState',
  setTrailerStateSuccess = 'TrailersActionTypes.setTrailerStateSuccess',
  setTrailerStateFail = 'TrailersActionTypes.setTrailerStateFail',
  readTrailerState = 'TrailersActionTypes.readTrailerState',
  readTrailerStateSuccess = 'TrailersActionTypes.readTrailerStateSuccess',
  readTrailerStateFail = 'TrailersActionTypes.readTrailerStateFail',
}

export function selectTrailer(id: TrailerId | null) {
  return { type: TrailersActionTypes.selectTrailer, payload: { id } };
}

export function filterTrailers(query: string) {
  return {
    type: TrailersActionTypes.filterTrailers,
    payload: { query },
  };
}

export function fetchTrailers() {
  return async (dispatch: Dispatch, getState: () => State) => {
    const { auth } = getState();
    dispatch({ type: TrailersActionTypes.fetchTrailersSent });
    try {
      const { data } = await api.fetchTrailers({ auth });
      const payload = data.reduce(handleApiResponse, { order: [], entities: {} });
      dispatch({ type: TrailersActionTypes.fetchTrailersSuccess, payload });
    } catch (error) {
      dispatch({ type: TrailersActionTypes.fetchTrailersFail, error: true, payload: { error } });
    }
  };
}

export function setTrailerState(id: TrailerId, status: TrailerStates) {
  return async (dispatch: ThunkDispatch<State, {}, Action>, getState: () => State) => {
    const state = getState();
    const { auth } = state;
    const trailer = state.trailers.entities[id];
    dispatch({ type: TrailersActionTypes.setTrailerState, payload: { id, status } });
    try {
      const { data } = await api.setTrailerState({ id, status, auth });
      dispatch(fetchEvents(id));
      const trailer = mapTrailer(data);
      delete trailer.permission;
      dispatch({ type: TrailersActionTypes.setTrailerStateSuccess, payload: { id, trailer } });
    } catch (error) {
      dispatch({ type: TrailersActionTypes.setTrailerStateFail, error: true, payload: { error, id, trailer } });
    }
  };
}

export function readTrailerState(id: TrailerId) {
  return async (dispatch: ThunkDispatch<State, {}, Action>, getState: () => State) => {
    const state = getState();
    const { auth } = state;
    // const trailer = state.trailers.entities[id];
    // dispatch({ type: TrailersActionTypes.readTrailerState, payload: { id } });
    try {
      await api.readTrailerState({ id, auth });
      // dispatch({ type: TrailersActionTypes.readTrailerStateSuccess, payload: { id, trailer } });
    } catch (error) {
      // dispatch({ type: TrailersActionTypes.readTrailerStateFail, error: true, payload: { error, id, trailer } });
    }
  };
}

type Interaction = TrailerEvent['interactions'][0];
export function resolveAlarm(id: TrailerEventId) {
  return async (dispatch: ThunkDispatch<State, {}, Action>, getState: () => State) => {
    const { auth } = getState();
    try {
      const { data } = await api.resolveAlarm({ id, auth });

      const interactions = data.interactions
        .map(mapInteraction)
        .sort((a: Interaction, b: Interaction) => a.date.getTime() - b.date.getTime())
        .filter((interaction: Interaction, index: number, array: Interaction[]) => {
          return array.findIndex(i => i.type === interaction.type) >= index;
        });

      dispatch({ type: TrailerEventsActionTypes.setEventInteractions, payload: { id: data.id, interactions } });
    } catch (error) {
      alert(error);
    }
  };
}

type Accumulator = {
  order: TrailerId[];
  entities: Trailer;
};

function handleApiResponse({ order, entities }: Accumulator, trailer: any): Accumulator {
  return {
    order: [trailer.id, ...order],
    entities: {
      ...entities,
      [trailer.id]: mapTrailer(trailer),
    },
  };
}

export function mapTrailer(trailer: any) {
  return {
    id: trailer.id,
    plateNumber: trailer.registration_number,
    name: `${trailer.make} ${trailer.model}`,
    lastLogin: new Date(trailer.updated_at),
    state: TrailerStates.from(trailer.status),
    spedition_company: trailer.spedition_company,
    engine_running: trailer.engine_running,
    network_available: (new Date() - new Date(trailer.updated_at)) < 90000,
    permission: trailer.access_permission
      ? {
          alarmControl: trailer.access_permission.alarm_control, //kontrola alarmu
          alarmResolveControl: trailer.access_permission.alarm_resolve_control, //kontrola rozwiązywania alarmów
          currentPosition: trailer.access_permission.current_position, //aktualna pozycja
          eventLogAccess: trailer.access_permission.event_log_access, //dziennik zdarzeń
          loadInModeControl: trailer.access_permission.load_in_mode_control, //kontrola trybu ładowania
          monitoringAccess: trailer.access_permission.monitoring_access, //dostęp do monitoringu
          photoDownload: trailer.access_permission.photo_download, //pobieranie zdjęć
          routeAccess: trailer.access_permission.route_access, //dostęp do tras
          sensorAccess: trailer.access_permission.sensor_access, //czujniki
          systemArmControl: trailer.access_permission.system_arm_control, //kontrola uzbrajania systemu
          videoDownload: trailer.access_permission.video_download, //pobieranie wideo
        }
      : {},
    position: trailer.current_position
      ? {
          lat: trailer.current_position.latitude !== null ? Number.parseFloat(trailer.current_position.latitude) : null,
          lng:
            trailer.current_position.longitude !== null ? Number.parseFloat(trailer.current_position.longitude) : null,

          date: new Date(trailer.current_position.date).toISOString(),
          speed: trailer.current_position.speed,
          signal: trailer.current_position.signal,
          name: trailer.current_position.location_name,
        }
      : {
          lat: null,
          lng: null,
          date: null,
          name: null,
          speed: null,
          signal: null
        },
    driver: drivers[Number.parseInt(trailer.id, 10) % drivers.length],
    cameraSettings: trailer.camera_settings.reduce((acc: any, setting: any) => {
      const cameraType = MonitoringCameras.fromApi(setting.camera_type);
      return {
        ...acc,
        [cameraType]: {
          installedAt: setting.installed_at,
          type: cameraType,
        },
      }
    }, {}),
  };
}

const drivers = [
  'Kierowca Testowy'
];
