import moment from 'moment';
import { createSelectorCreator, createSelector } from 'reselect';

import memoize from '../utils/memoize';
import { State } from '../store';
import { TrailerEventsState } from './reducer';
import { compareAsUniqueArrays } from '../utils/comparators';
import { getTrailer } from '../trailers/selectors';
import { TrailerStates } from '../trailers/types';
import { TrailerEventTypeCategory } from './types';

const getEvents = ({ events }: State) => events.entities;
const getFilters = ({ events }: State) => events.filters;
const getTrailerEvents = ({ trailers, events }: State) => trailers.active && events.trailerEvents[trailers.active];
const getMinDate = ({ events }: State) => events && events.minDate;
const getMaxDate = ({ events }: State) => events && events.maxDate;

type Filters = TrailerEventsState['filters'];
const compareFilters = (a: Filters, b: Filters) =>
  Object.entries(a).every(([key, val]) => TrailerStates.isTrailerState(key) && b[key] === val);

const customCreateSelector = createSelectorCreator(memoize, [compareAsUniqueArrays, null, compareFilters]);

const makeSelector = (category: TrailerEventTypeCategory) =>
  customCreateSelector(
    [getEvents, getTrailer, getFilters, getMinDate, getMaxDate],
    (events, trailer, filters, minDate, maxDate) => {
      const currentEvents = Object.values(events).filter(
        event =>
          event.trailerId === trailer &&
          filters[event.type] &&
          TrailerStates.toCategory(event.type) === category &&
          event.location &&
          event.location.lat !== null &&
          event.location.lng !== null &&
          moment(event.date).isBetween(moment(minDate).startOf('day'), moment(maxDate).endOf('day')),
      );
      return currentEvents;
    },
  );

export const getAlarmEvents = makeSelector(TrailerEventTypeCategory.alarm);
export const getArmedEvents = makeSelector(TrailerEventTypeCategory.armed);
export const getLoadingEvents = makeSelector(TrailerEventTypeCategory.loading);
export const getWarningEvents = makeSelector(TrailerEventTypeCategory.warning);
export const getNormalEvents = makeSelector(TrailerEventTypeCategory.normal);
export const getParkingEvents = makeSelector(TrailerEventTypeCategory.parking);

export const extractTrailerEvents = createSelector(
  [getEvents, getTrailerEvents],
  (events, trailerEvents) => {
    return (trailerEvents || []).map(eventId => events[eventId]);
  },
);

export const removeSpecificEvents = (typesToExclude: TrailerStates[]) =>
  createSelector(
    [extractTrailerEvents],
    events => events.filter(event => !typesToExclude.includes(event.type)),
  );

export const getSortedEvents = createSelector(
  [extractTrailerEvents],
  events => events.sort((first, second) => (first.date && second.date ? +second.date - +first.date : 0)),
);
