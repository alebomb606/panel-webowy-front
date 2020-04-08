import React, { useEffect } from 'react';
import moment from 'moment';
import { RouteComponentProps } from 'react-router';
import { ThunkDispatch } from 'redux-thunk';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import Events from './events';
import Location from './location';
import Monitoring from './monitoring';
import Sensors from './sensors';
import styled from '../../theme';
import { FullscreenIcon } from '../../common/icons';
import { Link } from 'react-router-dom';
import { MonitoringCameras, MonitoringCamera } from '../../monitoring/types';
import { MonitoringState } from '../../monitoring/reducer';
import { SensorsState, SensorEntry } from '../../sensors/reducer';
import { State } from '../../store';
import { Trailer, TrailersState } from '../reducer';
import { TrailerEventsState, TrailerEvent } from '../../events/reducer';
import { fetchEvents } from '../../events/actions';
import { fetchMedia, selectCamera, selectTime } from '../../monitoring/actions';
import { fetchSensors } from '../../sensors/actions';
import { getSnapshotForTime } from '../../monitoring/selectors';
import { removeSpecificEvents } from '../../events/selectors';
import { getTrailerSensors } from '../../sensors/selectors';
import { openModal } from '../../ui/actions';
import { requestMedia } from '../../monitoring/actions';
import { TrailerStates } from '../types';

interface TrailerOverviewOwnProps {
  trailers: TrailersState;
  trailer: Trailer | null;
  match: RouteComponentProps['match'];
}

interface TrailerOverviewProps {
  events: TrailerEventsState;
  sensors: SensorsState;
  monitoring: MonitoringState;
  ui: MonitoringState['ui'];
  snapshot: { [key in MonitoringCameras]: MonitoringCamera };
  trailerEvents: TrailerEvent[];
  trailerSensors: SensorEntry | null;
}

interface TrailerOverviewActions {
  actions: {
    fetchSensors: ActionProp<typeof fetchSensors>;
    fetchEvents: ActionProp<typeof fetchEvents>;
    fetchMedia: ActionProp<typeof fetchMedia>;
    requestMedia: ActionProp<typeof requestMedia>;
    openModal: ActionProp<typeof openModal>;
    selectCamera: ActionProp<typeof selectCamera>;
    selectTime: ActionProp<typeof selectTime>;
  };
}

type Props = TrailerOverviewOwnProps & TrailerOverviewProps & TrailerOverviewActions;

function TrailerOverview({
  trailers,
  trailer,
  events,
  monitoring,
  ui,
  trailerEvents,
  trailerSensors,
  sensors,
  snapshot,
  actions,
  match,
}: Props) {
  useEffect(() => {
    if (!trailer) return;
    actions.fetchSensors(trailer.id);
    actions.fetchEvents(trailer.id);
    actions.fetchMedia(trailer.id);
  }, [trailer && trailer.id]);

  useEffect(() => {
    if (!trailer) return;
    actions.fetchMedia(trailer.id);
  }, [trailer && trailer.id && monitoring && (monitoring.ui.isNow || monitoring.ui.time)]);

  const refreshSensors = () => {
    trailer && actions.fetchSensors(trailer.id);
  };

  const requestImage = (type: MonitoringCameras) => {
    trailer &&
      actions.requestMedia(trailer.id, {
        type: 'photo',
        camera: type,
        time: new Date(ui.time),
      });
  };

  return (
    <>
      <Sensors
        sensors={trailerSensors}
        loading={sensors.loading || false}
        error={sensors.error}
        refreshSensors={refreshSensors}
        url={match.url}
      />
      <Row>
        <Monitoring
          snapshot={snapshot}
          cameraSettings={trailer?.cameraSettings}
          selectCamera={actions.selectCamera}
          openModal={actions.openModal}
          requestImage={requestImage}
          currentTime={ui.time}
          setCurrentTime={() => {
            actions.selectTime(
              moment()
                .startOf('minute')
                .toISOString(),
              true,
            );
          }}
          selectTime={actions.selectTime}
        />
        <Column>
          <Location trailer={trailer} error={trailers.error} loading={!trailer || !trailer.position}>
            <Fullscreen to={'/map'}>
              <FullscreenIcon wrapperSize={40} active iconSize={30} color={'black'} backgroundColor={'transparent'} />
            </Fullscreen>
          </Location>
          <Events
            setEventTime={(date: Date) => {
              actions.selectTime(date.toISOString());
            }}
            selectedTime={ui.time}
            events={trailerEvents}
            loading={events.loading || false}
            error={events.error}
            url={match.url}
            refreshList={() => trailer && actions.fetchEvents(trailer.id)}
          />
        </Column>
      </Row>
    </>
  );
}

const filterEvents = removeSpecificEvents([TrailerStates.off, TrailerStates.silenced, TrailerStates.resolved]);

const mapStateToProps = (state: State): TrailerOverviewProps => ({
  events: state.events,
  sensors: state.sensors,
  monitoring: state.monitoring,
  ui: state.monitoring.ui,
  trailerSensors: getTrailerSensors(state),
  snapshot: getSnapshotForTime(state),
  trailerEvents: filterEvents(state),
});

const mapDispatchToProps = (dispatch: ThunkDispatch<State, {}, Action>): TrailerOverviewActions => ({
  actions: bindActionCreators(
    {
      fetchSensors,
      fetchEvents,
      fetchMedia,
      requestMedia,
      openModal,
      selectCamera,
      selectTime,
    },
    dispatch,
  ),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(TrailerOverview);

const Fullscreen = styled(Link)`
  background: none white;
  padding: 0;
  position: absolute;
  user-select: none;
  border-radius: 2px;
  box-shadow: rgba(0, 0, 0, 0.3) 0px 1px 4px -1px;
  top: 10px;
  right: 10px;
  height: 40px;
  width: 40px;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  flex: 123;
`;
