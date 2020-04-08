import React, { useEffect } from 'react';
import { ThunkDispatch } from 'redux-thunk';
import { connect } from 'react-redux';
import { useTranslation } from 'react-i18next';

import styled from '../theme';

import { RoutesQuery, EventsQuery } from '../api';
import { State } from '../store';
import { TrailerEventsState, TrailerEvent } from '../events/reducer';
import { TrailerPosition } from '../routes/reducer';
import { TrailersState, TrailerId } from '../trailers/reducer';
import { fetchRoutes } from '../routes/actions';
import { filterTrailers, fetchTrailers } from '../trailers/actions';
import { getRoutePoints, isRouteLoading } from '../routes/selectors';
import { selectTrailer } from '../trailers/actions';
import { setFilterValue, setMaxDateValue, setMinDateValue, fetchEvents, resetFilters } from '../events/actions';
import { getAlarmEvents, getArmedEvents, getLoadingEvents, getWarningEvents, getNormalEvents, getParkingEvents } from '../events/selectors';

import ClearSearch from './components/clear-search';
import EventFilters from '../common/event-filters';
import MapPanel from '../common/map-panel';
import RedirectToTrailer from '../common/redirect-to-trailer';
import Spinner from '../common/spinner';
import TrailersList from '../common/trailers-list';
import { RouteComponentProps } from 'react-router-dom';
import { TrailerStates } from '../trailers/types';
import { getTrailersOrderFilteredByQuery } from '../trailers/selectors';
import { Moment } from 'moment';

interface LocationProps {
  trailers: TrailersState;
  events: TrailerEventsState;
  routes: TrailerPosition[][];
  alarmEvents: TrailerEvent[];
  loadingEvents: TrailerEvent[];
  armedEvents: TrailerEvent[];
  warningEvents: TrailerEvent[];
  parkingEvents: TrailerEvent[];
  normalEvents: TrailerEvent[];
  isRouteLoading: boolean;
}

interface LocationActions {
  actions: {
    selectTrailer: (id: TrailerId | null) => void;
    filterTrailers: (query: string) => void;
    setFilterValue: (filter: TrailerStates, value: boolean) => void;
    setMinDateValue: (date: Date | Moment) => void;
    setMaxDateValue: (date: Date | Moment) => void;
    fetchEvents: (id: TrailerId, filters: EventsQuery) => void;
    fetchRoutes: (id: TrailerId, filters: RoutesQuery) => void;
    fetchTrailers: () => void;
    resetFilters: ActionProp<typeof resetFilters>;
  };
}

export type Props = RouteComponentProps<{ id: TrailerId }> & LocationProps & LocationActions;

function LocationRoute(props: Props) {
  const {
    trailers,
    actions,
    events,
    routes,
    match,
    loadingEvents,
    alarmEvents,
    armedEvents,
    warningEvents,
    parkingEvents,
    normalEvents,
    isRouteLoading,
  } = props;

  useEffect(() => {
    actions.fetchTrailers();
  }, [match.path]);

  const trailer = match.params.id in trailers.entities ? trailers.entities[match.params.id] : null;
  const id = trailer && trailer.id ? trailer.id : null;

  useEffect(() => {
    actions.selectTrailer(id);
    if (id) {
      actions.fetchEvents(id, { from: events.minDate, to: events.maxDate, kinds: events.filters });
      actions.fetchRoutes(id, { from: events.minDate, to: events.maxDate });
    }
  }, [id, events.filters, events.minDate, events.maxDate]);

  useEffect(() => {
    return () => {
      actions.resetFilters();
    };
  }, []);

  const { t } = useTranslation();

  const points = trailer ? [trailer] : [];

  return (
    <Container>
      <RedirectToTrailer active={trailers.active} order={trailers.order}>
        <TrailersList
          match={match}
          trailers={trailers}
          onTrailerClick={actions.selectTrailer}
          updateQuery={actions.filterTrailers}
        />
        <MapPanel
          selectedTrailer={trailers.active}
          trailers={points}
          loadingEvents={loadingEvents}
          alarmEvents={alarmEvents}
          armedEvents={armedEvents}
          warningEvents={warningEvents}
          normalEvents={normalEvents}
          parkingEvents={parkingEvents}
          routes={routes}
          containerElement={<FullscreenMap />}
          mapElement={<FullscreenElement style={{ position: 'absolute' }} />}
          onMarkerClick={id => id && actions.selectTrailer(id)}
        >
          {isRouteLoading && <RouteLoading />}
        </MapPanel>
        <EventFilters
          description={`${t`filters`}:`}
          container={MapFiltersContainer}
          filters={events.filters}
          minDate={events.minDate}
          maxDate={events.maxDate}
          onFilterChange={actions.setFilterValue}
          onMinDateChange={actions.setMinDateValue}
          onMaxDateChange={actions.setMaxDateValue}
        />
        <ClearSearch query={trailers.query} onClick={() => actions.filterTrailers('')} />
      </RedirectToTrailer>
    </Container>
  );
}

const mapStateToProps = (state: State): LocationProps => {
  return {
    trailers: {
      ...state.trailers,
      order: getTrailersOrderFilteredByQuery(state),
    },
    alarmEvents: getAlarmEvents(state),
    armedEvents: getArmedEvents(state),
    loadingEvents: getLoadingEvents(state),
    warningEvents: getWarningEvents(state),
    normalEvents: getNormalEvents(state),
    parkingEvents: getParkingEvents(state),
    events: state.events,
    routes: getRoutePoints(state),
    isRouteLoading: isRouteLoading(state),
  };
};

const mapDispatchToProps = (dispatch: ThunkDispatch<State, {}, Action>): LocationActions => ({
  actions: {
    selectTrailer: (id: TrailerId | null) => dispatch(selectTrailer(id)),
    filterTrailers: (query: string) => dispatch(filterTrailers(query)),
    setFilterValue: (filter: TrailerStates, value: boolean) => dispatch(setFilterValue(filter, value)),
    setMinDateValue: (date: Date | Moment) => dispatch(setMinDateValue(date)),
    setMaxDateValue: (date: Date | Moment) => dispatch(setMaxDateValue(date)),
    fetchTrailers: () => dispatch(fetchTrailers()),
    fetchEvents: (id: TrailerId, filter: EventsQuery) => dispatch(fetchEvents(id, filter)),
    fetchRoutes: (id: TrailerId, filter: RoutesQuery) => dispatch(fetchRoutes(id, filter)),
    resetFilters: () => dispatch(resetFilters()),
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(LocationRoute);

const RouteLoading = () => (
  <LoadingContainer>
    <Spinner wrapperHeight={100} wrapperWidth={100} spinnerSize={100} />
  </LoadingContainer>
);

const LoadingContainer = styled.div`
  position: absolute;
  width: 100px;
  height: 100px;
  top: 50%;
  left: calc(50% + 280px / 2);
  transform: translate(-50%, -50%);
  background: white;
  border-radius: 20px;
`;

const Container = styled.div`
  position: relative;
  margin-left: auto;
  margin-right: auto;
  max-width: 1920px;
  min-height: calc(100vh - 110px);
  display: flex;
  flex-direction: row;
  justify-content: stretch;
  align-items: stretch;
  background-color: #ffffff;
`;

const FullscreenElement = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  max-height: calc(100vh - 110px);
  max-width: calc(100vw - 280px);
`;

const FullscreenMap = styled.div`
  width: 100%;
  & > * > :nth-child(2),
  & > * > :nth-child(3) {
    display: none !important;
  }
`;

const MapFiltersContainer = styled.div`
  padding: 0 20px;
  width: 900px;
  height: 50px;
  position: absolute;
  top: 20px;
  left: calc(50vw + 280px / 2);
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  background: white;
  border-radius: 5px;
  box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 0.15);
`;
