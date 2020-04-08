import React from 'react';
import { Link } from 'react-router-dom';
import { lighten, darken } from 'polished';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

import styled from '../theme';
import { Trailer } from '../trailers/reducer';
import { TrailerStates } from '../trailers/types';

interface TrailerProps {
  trailer: Trailer;
  selected: boolean;
  onClick: () => void;
  url: string;
}

interface PropertyProps {
  name: string;
  value?: number | string;
  className?: string;
}

interface StateProps {
  state?: TrailerStates;
  children: string;
}

interface ContainerProps {
  state?: TrailerStates;
  selected: boolean;
}

export default function TrailerRow(props: TrailerProps) {
  const { selected, onClick, trailer, url } = props;

  const { t } = useTranslation(['trailers']);

  /* const location =
    trailer.position &&
    (trailer.position.name
      ? trailer.position.name
      : `${(trailer.position.lng || 0).toFixed(3)} ${(trailer.position.lat || 0).toFixed(3)}`); */

  return (
    <Container to={url.replace(':id', trailer.id)} selected={selected} state={trailer.state} onClick={onClick}>
      <Header>{trailer.plateNumber}</Header>
      {trailer.state && (
        <State state={trailer.state}>
          {t(trailer.state === TrailerStates.resolved ? TrailerStates.ok : trailer.state)}
        </State>
      )}
      <Property name={t`name`} value={trailer.name} />
      <Property name={t`last_login`} value={moment(trailer.lastLogin).format('LT L')} />
      <Property name={t`base_time`} value={moment(trailer.baseTime).format('LT L')} />
      <Property name={t`engine_status`} value={trailer.engine_running?"ON":"OFF"} />
      <Property name={t`network_status`} value={trailer.network_available?"ON":"OFF"} />
    </Container>
  );
}

const borders: { [key in TrailerStates]: string } = {
  [TrailerStates.startLoading]: '#ebf3fd',

  [TrailerStates.alarm]: '#d0021b',
  [TrailerStates.quiet]: '#d0021b',
  [TrailerStates.emergency]: '#d0021b',

  [TrailerStates.armed]: '#ebf3fd',

  [TrailerStates.warning]: '#ebf3fd',

  [TrailerStates.off]: '#ebf3fd',

  [TrailerStates.truckDisconnected]: '#d0021b',
  [TrailerStates.truckConnected]: '#ebf3fd',
  [TrailerStates.shutdownPending]: '#ebf3fd',
  [TrailerStates.shutdownImmediate]: '#d0021b',
  [TrailerStates.truckBatteryLow]: '#d0021b',
  [TrailerStates.truckBatteryNormal]: '#ebf3fd',
  [TrailerStates.truckEngineOff]: '#ebf3fd',
  [TrailerStates.truckEngineOn]: '#ebf3fd',
  [TrailerStates.truckParkingOff]: '#ebf3fd',
  [TrailerStates.truckParkingOn]: '#ebf3fd',

  [TrailerStates.endLoading]: '#ebf3fd',
  [TrailerStates.silenced]: '#ebf3fd',
  [TrailerStates.resolved]: '#ebf3fd',
  [TrailerStates.disarmed]: '#ebf3fd',
  [TrailerStates.ok]: '#ebf3fd',
  [TrailerStates.unknown]: '#ebf3fd',
};

const stateColors: { [key in TrailerStates]: string } = {
  [TrailerStates.startLoading]: '#606f91',

  [TrailerStates.alarm]: '#d0021b',
  [TrailerStates.quiet]: '#d0021b',
  [TrailerStates.emergency]: '#d0021b',

  [TrailerStates.armed]: '#5fa80f',

  [TrailerStates.warning]: '#d0021b',

  [TrailerStates.truckDisconnected]: '#d0021b',
  [TrailerStates.truckConnected]: '#a0a0a0',
  [TrailerStates.shutdownPending]: '#ffd700',
  [TrailerStates.shutdownImmediate]: '#d0021b',
  [TrailerStates.truckBatteryLow]: '#ffd700',
  [TrailerStates.truckBatteryNormal]: '#a0a0a0',
  [TrailerStates.truckEngineOff]: '#a0a0a0',
  [TrailerStates.truckEngineOn]: '#a0a0a0',
  [TrailerStates.truckParkingOff]: '#2d30da',
  [TrailerStates.truckParkingOn]: '#2d30da',

  [TrailerStates.off]: '#a0a0a0',
  [TrailerStates.endLoading]: '#a0a0a0',
  [TrailerStates.silenced]: '#a0a0a0',
  [TrailerStates.resolved]: '#a0a0a0',
  [TrailerStates.disarmed]: '#5fa80f',
  [TrailerStates.ok]: '#a0a0a0',
  [TrailerStates.unknown]: '#a0a0a0',
};

const backgrounds: { [key in TrailerStates]: string } = {
  [TrailerStates.startLoading]: '#ebf3fd',

  [TrailerStates.alarm]: '#ebf3fd',
  [TrailerStates.quiet]: '#ebf3fd',
  [TrailerStates.emergency]: '#ebf3fd',

  [TrailerStates.armed]: '#ebf3fd',

  [TrailerStates.warning]: '#ebf3fd',

  [TrailerStates.truckDisconnected]: '#ebf3fd',
  [TrailerStates.truckConnected]: '#ebf3fd',
  [TrailerStates.shutdownPending]: '#ebf3fd',
  [TrailerStates.shutdownImmediate]: '#ebf3fd',
  [TrailerStates.truckBatteryLow]: '#ebf3fd',
  [TrailerStates.truckBatteryNormal]: '#ebf3fd',
  [TrailerStates.truckEngineOff]: '#ebf3fd',
  [TrailerStates.truckEngineOn]: '#ebf3fd',
  [TrailerStates.truckParkingOff]: '#ebf3fd',
  [TrailerStates.truckParkingOn]: '#ebf3fd',

  [TrailerStates.off]: '#ebf3fd',
  [TrailerStates.endLoading]: '#ebf3fd',
  [TrailerStates.silenced]: '#ebf3fd',
  [TrailerStates.resolved]: '#ebf3fd',
  [TrailerStates.disarmed]: '#ebf3fd',
  [TrailerStates.ok]: '#ebf3fd',
  [TrailerStates.unknown]: '#ebf3fd',
};

function backgroundColor(props: ContainerProps) {
  const { selected, state = TrailerStates.unknown } = props;
  const modifier = selected ? 0 : 0.1;
  const color = backgrounds[state];
  return lighten(modifier, color);
}

function borderColor(props: ContainerProps) {
  const { selected, state = TrailerStates.unknown } = props;
  const modifier =
    selected &&
    !(state === TrailerStates.alarm) &&
    !(state === TrailerStates.quiet) &&
    !(state === TrailerStates.emergency)
      ? 0.5
      : -0.1;
  const color = borders[state];
  return `10px solid ${darken(modifier, color)}`;
}

function stateColor({ state = TrailerStates.unknown }: StateProps) {
  return stateColors[state];
}

const Container = styled(Link)<ContainerProps>`
  padding: 10px 10px;
  min-width: 100%;
  height: 140px;
  display: block;
  position: relative;
  text-decoration: none;
  background-color: ${backgroundColor};
  border-left: ${borderColor};
  border-top: 1px solid silver;
  user-select: none;
  cursor: pointer;
  &:last-of-type {
    border-bottom: 1px solid silver;
  }
`;

export const Header = styled.h5`
  margin: 0 0 10px 0;
  max-width: 115px;
  font-size: 18px;
  font-weight: 600;
  line-height: 18px;
  color: #000000;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`;

const State = styled.div<StateProps>`
  position: absolute;
  top: 12px;
  right: 15px;
  color: ${stateColor};
  font-size: 12px;
  line-height: 15px;
  &:before {
    content: '⬤';
    position: absolute;
    top: 0;
    left: -15px;
    font-size: 10px;
    line-height: 15px;
    color: ${stateColor};
  }
  display: inline-block;
  &::first-letter {
    text-transform: capitalize;
  }
`;

const Label = styled.div`
  margin: 2px 0;
  font-size: 12px;
  line-height: 15px;
`;

const Caption = styled.div`
  color: #808080;
  overflow: hidden;
  display: inline-block;
  &::first-letter {
    text-transform: capitalize;
  }
`;

const Value = styled.div`
  color: #000000;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  width: 50%;
  display: inline-block;
`;

export const Property = ({ name, value = '---', className }: PropertyProps) => {
  return (
    <Label className={className}>
      <Caption>{name}:</Caption> <Value>{value}</Value>
    </Label>
  );
};
