import { createSelector } from 'reselect';

import { State } from '../store';
import { Trailer, TrailerId } from './reducer';
import { TrailerStates, TrailerPermissions } from './types';

const getQuery = ({ trailers }: State) => trailers.query;
const getTrailers = ({ trailers }: State) => trailers.entities;
const getOrder = ({ trailers }: State) => trailers.order;

export const getTrailer = ({ trailers }: State) => trailers.active;
export const getActiveTrailer = ({ trailers }: State) =>
  (trailers.active && trailers.entities[trailers.active]) || null;

type TrailerProps = keyof Trailer;
type StringPropNamesOrNever = { [P in keyof Trailer]: Trailer[P] extends string | undefined ? P : never };
type TrailerStringProps = Exclude<StringPropNamesOrNever[TrailerProps], undefined>;

const priorities: { [key in TrailerStates]: number } = {
  [TrailerStates.alarm]: 0,
  [TrailerStates.quiet]: 0,
  [TrailerStates.emergency]: 0,
  [TrailerStates.shutdownImmediate]: 0,
  [TrailerStates.silenced]: 1,
  [TrailerStates.truckBatteryLow]: 1,
  [TrailerStates.truckDisconnected]: 1,
  [TrailerStates.warning]: 2,
  [TrailerStates.shutdownPending]: 2,
  [TrailerStates.truckParkingOn]: 2,
  [TrailerStates.truckParkingOff]: 2,
  [TrailerStates.truckConnected]: 4,
  [TrailerStates.truckBatteryNormal]: 4,
  [TrailerStates.truckEngineOff]: 4,
  [TrailerStates.truckEngineOn]: 4,
  [TrailerStates.off]: 4,
  [TrailerStates.resolved]: 4,
  [TrailerStates.armed]: 4,
  [TrailerStates.disarmed]: 4,
  [TrailerStates.startLoading]: 4,
  [TrailerStates.endLoading]: 4,
  [TrailerStates.ok]: 8,
  [TrailerStates.unknown]: 16,
};

export const getSortedOrder = createSelector(
  [getOrder, getTrailers],
  (order, trailers) => {
    return order.slice().sort((idA: TrailerId, idB: TrailerId) => {
      const trailerA = trailers[idA];
      const trailerB = trailers[idB];
      const prio =
        priorities[trailerA.state || TrailerStates.unknown] - priorities[trailerB.state || TrailerStates.unknown];
      if (prio === 0 || trailerA.state === trailerB.state) {
        return trailerA.plateNumber.localeCompare(trailerB.plateNumber);
      }
      return prio;
    });
  },
);

export const getTrailersOrderFilteredByQuery = createSelector(
  [getQuery, getTrailers, getSortedOrder],
  (query, trailers, order) =>
    order.filter(id => {
      const trailer = trailers[id];
      const selectedFields: TrailerStringProps[] = ['id', 'plateNumber', 'name'];
      const definedFields = selectedFields.map(field => trailer[field] || '');
      const preparedToMatch = definedFields.map(field => field.toLowerCase().trim());
      return preparedToMatch.some(field => field.includes(query.toLowerCase().trim()));
    }),
);

export const getPermission = (permission: TrailerPermissions) =>
  createSelector(
    [getActiveTrailer],
    trailer => {
      if (trailer) {
        return trailer.permission[permission];
      }
      return false;
    },
  );
