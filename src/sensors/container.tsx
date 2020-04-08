import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { match as Match } from 'react-router-dom';

import styled from '../theme';

import Chart from './components/chart';
import SensorEvents from './components/sensor-events';
import Settings from './components/settings';
import Stats from './components/stats';
import snakeToCamel from '../utils/snake-to-camel';
import { openModal } from '../ui/actions';
import { SensorTypes, SensorsState, SensorEvent, SensorSettings, SensorId } from './reducer';
import { State } from '../store';
import { ThunkDispatch } from 'redux-thunk';
import { TrailerId } from '../trailers/reducer';
import { fetchSensorEvents, fetchSensors, fetchSensorSettings, patchSensorSettings } from './actions';
import { ModalComponentTypes } from '../ui/reducer';
import { AlertProps } from '../header/components/arm-alert';
import { useTranslation } from 'react-i18next';

interface OwnProps {
  match: Match<{ id: TrailerId; sensorId: SensorTypes }>;
}

interface ContainerProps {
  sensors: SensorsState;
}

interface ContainerActions {
  actions: {
    fetchSensors: (id: TrailerId) => void;
    fetchSensorEvents: (id: TrailerId, sensorId: SensorId) => void;
    fetchSensorSettings: (sensorId: SensorId, id: string) => void;
    patchSensorSettings: (sensorId: SensorId, settings: SensorSettings, id: string) => void;
    openModal: (props: AlertProps) => void;
  };
}

type Props = OwnProps & ContainerProps & ContainerActions;

function DetailedSensor({ sensors, actions, match }: Props) {
  const { id, sensorId } = match.params;

  const { t } = useTranslation('sensors');

  const camelcased = snakeToCamel(sensorId);

  const sensorEntry = sensors.sensors[id];
  const sensorType = SensorTypes.isSensorType(camelcased) ? camelcased : undefined;
  const sensor = sensorEntry && sensorType ? sensorEntry[sensorType] : undefined;
  const [sensorSettings, setSensorSettings] = useState(sensor && sensors.settings[sensor.id]);

  let events = new Array<SensorEvent>();

  const trailerSensors = sensors.order[id];

  if (trailerSensors !== undefined) {
    events = trailerSensors.map(id => sensors.alarms[id]).filter((obj: any): obj is SensorEvent => Boolean(obj));
  }

  useEffect(() => {
    if (id) {
      actions.fetchSensors(id);
    }
  }, [id, sensorType]);

  useEffect(() => {
    if (sensor) {
      actions.fetchSensorSettings(sensor.id, id);
      actions.fetchSensorEvents(id, sensor.id);
    }
  }, [sensor && sensor.id]);

  useEffect(() => {
    if (sensor && !sensorSettings) {
      setSensorSettings(sensors.settings[sensor.id]);
    }
  }, [sensor && sensor.id, sensors.settings]);

  return (
    <SensorDetails>
      <LeftColumn>
        <Chart
          sensor={sensor}
          sensors={sensors}
          id={id}
          settings={sensorSettings}
          fetchSensors={actions.fetchSensors}
        />
        {sensor && <Stats sensor={sensor} />}
      </LeftColumn>
      <RightColumn>
        <SensorEvents sensorId={sensorId} events={events} />
        {sensorSettings && (
          <Settings
            settings={sensorSettings}
            updateSensorSettings={settings => {
              settings && setSensorSettings(settings);
            }}
            onCancelGoBackToTrailer={id}
            cancel={() => {
              if (sensor) {
                setSensorSettings(sensors.settings[sensor.id]);
              }
            }}
            save={() => {
              actions.openModal({
                labels: {
                  description: t`confirm_save`,
                },
                onConfirm: closeModal => {
                  if (sensor) actions.patchSensorSettings(sensor.id, sensorSettings, id);
                  closeModal();
                },
              });
            }}
          />
        )}
      </RightColumn>
    </SensorDetails>
  );
}

const mapStateToProps = (state: State): ContainerProps => {
  return {
    sensors: state.sensors,
  };
};

const mapDispatchToProps = (dispatch: ThunkDispatch<State, {}, Action>): ContainerActions => ({
  actions: {
    fetchSensors: (id: TrailerId) => dispatch(fetchSensors(id)),
    fetchSensorEvents: (id: TrailerId, sensorId: SensorId) => dispatch(fetchSensorEvents(id, sensorId)),
    fetchSensorSettings: (sensorId: SensorId, id: string) => dispatch(fetchSensorSettings(sensorId, id)),
    openModal: (props: AlertProps) => dispatch(openModal(ModalComponentTypes.alert, props)),
    patchSensorSettings: (sensorId: SensorId, settings: SensorSettings, id: string) =>
      dispatch(patchSensorSettings(sensorId, settings, id)),
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(DetailedSensor);

const SensorDetails = styled.div`
  margin: 8px;
  display: flex;
  flex-direction: row;
  background-color: #ffffff;
  box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.15);
`;

const LeftColumn = styled.div`
  padding: 15px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 39;
`;

const RightColumn = styled.div`
  padding: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 61;
`;
