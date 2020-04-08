import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { match as Match } from 'react-router-dom';
import { ThunkDispatch } from 'redux-thunk';
import { useTranslation } from 'react-i18next';
import moment, { Moment } from 'moment';

import DetailedEventsList from './components/detailed-events-list';
import EventFilters from '../common/event-filters';
import styled from '../theme';
import { EventsQuery } from '../api';
import { fetchEvents } from './actions';
import { openModal } from '../ui/actions';
import { State } from '../store';
import { setFilterValue, setMaxDateValue, setMinDateValue, resetFilters } from './actions';
import { TrailerEventsState, TrailerEvent } from './reducer';
import { TrailerId, Trailer } from '../trailers/reducer';
import { removeSpecificEvents } from '../events/selectors';
import { TrailerStates } from '../trailers/types';
import { selectTime, selectCamera } from '../monitoring/actions';
import { MonitoringCameras } from '../monitoring/types';
import { ModalComponentTypes } from '../ui/reducer';

interface OwnProps {
  match: Match<{ id: string; eventId?: string }>;
}
interface EventsRouteOwnProps {
  trailer: Trailer | null;
}
interface EventsRouteProps {
  events: TrailerEventsState;
  trailerEvents: TrailerEvent[];
}
interface EventsRouteActions {
  actions: {
    setFilterValue: (filter: TrailerStates, value: boolean) => void;
    setMinDateValue: (date: Date | Moment) => void;
    setMaxDateValue: (date: Date | Moment) => void;
    fetchEvents: (id: TrailerId, filters: EventsQuery) => void;
    selectTime: ActionProp<typeof selectTime>;
    selectCamera: ActionProp<typeof selectCamera>;
    openModal: ActionProp<typeof openModal>;
    resetFilters: ActionProp<typeof resetFilters>;
  };
}

type Props = OwnProps & EventsRouteOwnProps & EventsRouteProps & EventsRouteActions;

function EventsRoute({ trailer, trailerEvents, events, actions }: Props) {
  const refreshList = (trailer: Trailer | null) => {
    if (!trailer) {
      return;
    }
    actions.fetchEvents(trailer.id, {
      from: events.minDate,
      to: events.maxDate,
      kinds: events.filters,
    });
  };

  useEffect(() => {
    refreshList(trailer);
  }, [trailer && trailer.id, events.minDate, events.maxDate, events.filters]);

  useEffect(() => {
    return () => {
      actions.resetFilters();
    };
  }, []);

  const { t } = useTranslation();

  return (
    <DetailedHistoryList>
      <EventFilters
        description={`${t`show_only`}:`}
        container={FiltersContainer}
        filters={events.filters}
        minDate={events.minDate}
        maxDate={events.maxDate}
        onFilterChange={actions.setFilterValue}
        onMinDateChange={actions.setMinDateValue}
        onMaxDateChange={actions.setMaxDateValue}
      />
      <DetailedEventsList
        trailerEvents={trailerEvents}
        refreshList={() => refreshList(trailer)}
        showEventDetails={event => {
          actions.selectCamera(MonitoringCameras.interior);
          actions.selectTime(
            moment(event.date)
              .startOf('minute')
              .toISOString(),
          );
          actions.openModal(ModalComponentTypes.monitoring, {});
        }}
      />
      {/* <NextPageButton>Pobierz więcej</NextPageButton> */}
    </DetailedHistoryList>
  );
}

const filterEvents = removeSpecificEvents([TrailerStates.off, TrailerStates.silenced, TrailerStates.resolved]);

const mapStateToProps = (state: State): EventsRouteProps => ({
  events: state.events,
  trailerEvents: filterEvents(state),
});

const mapDispatchToProps = (dispatch: ThunkDispatch<State, {}, Action>): EventsRouteActions => ({
  actions: {
    setFilterValue: (filter: TrailerStates, value: boolean) => dispatch(setFilterValue(filter, value)),
    setMinDateValue: (date: Date | Moment) => dispatch(setMinDateValue(date)),
    setMaxDateValue: (date: Date | Moment) => dispatch(setMaxDateValue(date)),
    fetchEvents: (id: TrailerId, filter: EventsQuery) => dispatch(fetchEvents(id, filter)),
    selectCamera: camera => dispatch(selectCamera(camera)),
    selectTime: time => dispatch(selectTime(time)),
    openModal: (type, props) => dispatch(openModal(type, props)),
    resetFilters: () => dispatch(resetFilters()),
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(EventsRoute);

const DetailedHistoryList = styled.div`
  position: relative;
  margin: 8px;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.15);
`;

const FiltersContainer = styled.div`
  margin: 25px auto 30px;
  padding: 0 20px;
  width: 100%;
  height: 50px;
  display: flex;
  flex-direction: row;
  align-items: center;
`;

// const NextPageButton = styled.button`
//   margin: 25px auto;
//   width: 150px;
//   height: 36px;
//   font-size: 14px;
//   line-height: 1.5;
//   letter-spacing: normal;
//   text-align: center;
//   color: #ffffff;
//   background-color: #4a90e2;
//   border-radius: 4px;
// `;
