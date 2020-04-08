import React, { useEffect } from 'react';
import moment from 'moment';
import { RouteComponentProps, Route, Switch } from 'react-router';
import { ThunkDispatch } from 'redux-thunk';
import { connect } from 'react-redux';

import DetailedSensor from '../sensors/container';
import Events from '../events/container';
import Header from './components/header';
import RedirectToTrailer from '../common/redirect-to-trailer';
import TrailerOverview from './components/overview';
import TrailersList from '../common/trailers-list';
import styled from '../theme';
import { ModalComponentTypes } from '../ui/reducer';
import { MonitoringState } from '../monitoring/reducer';
import { State } from '../store';
import { TrailerId, TrailersState, Trailer } from './reducer';
import { TrailerStates } from './types';
import { fetchTrailers, filterTrailers, selectTrailer, setTrailerState, readTrailerState } from './actions';
import { getTrailersOrderFilteredByQuery } from './selectors';
import { openModal } from '../ui/actions';
import { selectTime } from '../monitoring/actions';

interface TrailersContainerProps {
  shouldRefreshTimer: boolean;
  trailers: TrailersState;
  monitoringTime: MonitoringState['ui']['time'];
}

export interface ArmModalProps {
  trailer: Trailer;
  getArmedStatus: (trailer: Trailer) => TrailerStates;
  setTrailerState: (id: TrailerId, status: TrailerStates) => void;
}

export interface AlarmModalProps {
  trailer: Trailer;
  getAlertStatus: (trailer: Trailer) => TrailerStates;
  setTrailerState: (id: TrailerId, status: TrailerStates) => void;
}

interface TrailersContainerActions {
  actions: {
    selectTrailer: (id: TrailerId | null) => void;
    filterTrailers: (query: string) => void;
    fetchTrailers: () => void;
    setTrailerState: (id: TrailerId, status: TrailerStates) => void;
    readTrailerState: (id: TrailerId) => void;
    openArmModal: (armModalProps: ArmModalProps) => void;
    openAlarmModal: (alarmModalProps: AlarmModalProps) => void;
    selectTime: ActionProp<typeof selectTime>;
  };
}

type Props = RouteComponentProps<{ id: TrailerId }> & TrailersContainerProps & TrailersContainerActions;

function TrailerRoute(props: Props) {
  const { trailers, actions, shouldRefreshTimer, monitoringTime, match } = props;

  useEffect(() => {
    props.actions.fetchTrailers();
  }, [match.path]);

  const trailer = match.params.id in trailers.entities ? trailers.entities[match.params.id] : null;

  useEffect(() => {
    const id = trailer && trailer.id ? trailer.id : null;
    props.actions.selectTrailer(id);
  }, [trailer && trailer.id]);

  useEffect(() => {
    let timer = setInterval(() => {
      let now = moment()
        .startOf('minute')
        .toISOString();
      if (shouldRefreshTimer && now !== monitoringTime) {
        actions.selectTime(now, shouldRefreshTimer);
      }
    }, 1 * 1000);

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [shouldRefreshTimer, monitoringTime]);

  return (
    <Container>
      <TrailersList
        match={match}
        trailers={trailers}
        onTrailerClick={trailerId => {
          actions.selectTime(
            moment()
              .startOf('minute')
              .toISOString(),
            true,
          );
          actions.selectTrailer(trailerId);
        }}
        updateQuery={actions.filterTrailers}
      />
      <TrailerDataWrapper>
        <Header
          match={match}
          trailer={trailer}
          setTrailerState={actions.setTrailerState}
          readTrailerState={actions.readTrailerState}
          openArmModal={actions.openArmModal}
          openAlarmModal={actions.openAlarmModal}
        />
        <Switch>
          <Route
            path={`${match.path}/events/:eventId?`}
            render={({ match }) => <Events trailer={trailer} match={match} />}
          />
          <Route path={`${match.path}/sensors/:sensorId`} render={({ match }) => <DetailedSensor match={match} />} />
          <RedirectToTrailer active={trailers.active} order={trailers.order}>
            <TrailerOverview trailers={trailers} trailer={trailer} match={match} />
          </RedirectToTrailer>
        </Switch>
      </TrailerDataWrapper>
    </Container>
  );
}

const mapStateToProps = (state: State): TrailersContainerProps => ({
  monitoringTime: state.monitoring.ui.time,
  trailers: {
    ...state.trailers,
    order: getTrailersOrderFilteredByQuery(state),
  },
  shouldRefreshTimer: state.monitoring.ui.isNow,
});

const mapDispatchToProps = (dispatch: ThunkDispatch<State, {}, Action>): TrailersContainerActions => ({
  actions: {
    selectTrailer: (id: TrailerId | null) => dispatch(selectTrailer(id)),
    filterTrailers: (query: string) => dispatch(filterTrailers(query)),
    fetchTrailers: () => dispatch(fetchTrailers()),
    setTrailerState: (id: TrailerId, status: TrailerStates) => dispatch(setTrailerState(id, status)),
    readTrailerState: (id: TrailerId) => dispatch(readTrailerState(id)),
    openArmModal: (armModalProps: ArmModalProps) =>
      dispatch(openModal(ModalComponentTypes.armAlert, { armModalProps })),
    openAlarmModal: (alarmModalProps: AlarmModalProps) =>
      dispatch(openModal(ModalComponentTypes.alarmAlert, { alarmModalProps })),
    selectTime: (date: string, isNow?: boolean) => dispatch(selectTime(date, isNow)),
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(TrailerRoute);

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

const TrailerDataWrapper = styled.div`
  padding: 8px;
  flex: 1;
  background-color: #f4f6f8;
`;
