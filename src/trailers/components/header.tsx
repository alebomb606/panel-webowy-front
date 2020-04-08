import React, {useEffect, useState} from 'react';
import {Link, Route, RouteComponentProps, Switch} from 'react-router-dom';
import {useTranslation} from 'react-i18next';

import {AlarmModalProps, ArmModalProps} from '../container';
import {ChevronRightIcon, InformationOutlineIcon, LightbulbOutlineIcon} from '../../common/icons';
import {SensorTypes} from '../../sensors/reducer';
import snakeToCamel from '../../utils/snake-to-camel';
import styled from '../../theme';
import {Trailer, TrailerId} from '../reducer';
import {TrailerStates} from '../types';
import {
  engineOff,
  engineOn,
  network17_24,
  network1_8,
  network25_31, network9_16,
  networkOff,
  networkOn,
  uestars
} from '../../assets';
import Tooltip from "react-tooltip-lite";

interface HeaderProps {
  match: RouteComponentProps<{ id: string }>['match'];
  trailer: Trailer | null;
  setTrailerState: (id: TrailerId, status: TrailerStates) => void;
  readTrailerState: (id: TrailerId) => void;
  openArmModal: (armModalProps: ArmModalProps) => void;
  openAlarmModal: (alarmModalProps: AlarmModalProps) => void;
}
interface AlertButtonProps {
  trailer: Trailer;
  setTrailerState: (id: TrailerId, status: TrailerStates) => void;
  openAlarmModal?: (alarmModalProps: AlarmModalProps) => void;
  alarmControlAllowed?: boolean;
}
interface StatusButtonProps extends AlertButtonProps {
  openArmModal: (armModalProps: ArmModalProps) => void;
}
interface LinkProps {
  trailer: Trailer | null;
  url: string;
}
interface IconProps {
  trailer: Trailer | null;
}
interface ReadProps {
  trailer: Trailer | null;
  readTrailerState: (id: TrailerId) => void;
}
interface NeutralButtonProps {
  children?: boolean | JSX.Element;
  active: boolean;
  text: string;
  onClick: () => void;
}
interface ContextButtonProps {
  text: string;
  onClick: () => void;
}

let iconUpdater: number;
let iconUpdaterID: string;

export default function Header({ match, trailer, setTrailerState, readTrailerState, openArmModal, openAlarmModal }: HeaderProps) {
  return (
    <VContainer>
      <Container>
        <CompanyLink url={match.url} trailer={trailer} />
      </Container>
      <Container>
        <CarNumberLink url={match.url} trailer={trailer} />
        <RefreshContainer trailer={trailer} readTrailerState={readTrailerState} render={() =>
            trailer && (
              <Container trailer={trailer} >
                <CarEngineRunning trailer={trailer} />
                <CarNetworkAvailable trailer={trailer} />
            </Container>
            )
        }
        />
        <Switch>
          <Route path={`${match.path}/events`} component={EventsBreadcrumb} />
          <Route path={`${match.path}/sensors/:sensorId`} component={SensorsBreadcrumb} />
          <Route
            path={`${match.path}/`}
            render={() =>
              trailer && (
                <TrailersContent
                  trailer={trailer}
                  setTrailerState={setTrailerState}
                  openAlarmModal={openAlarmModal}
                  openArmModal={openArmModal}
                />
              )
            }
          />
        </Switch>
      </Container>
    </VContainer>
  );
}

function CarNumberLink({ trailer, url }: LinkProps ) {
  const plateNumber = trailer && trailer.plateNumber ? trailer.plateNumber : '';

  return (
    <CarNumber to={url}>
      <CountryCode>
        <FlagWrapper>
          <Flag src={uestars} />
        </FlagWrapper>
        <Country>EU</Country>
      </CountryCode>
      <Number>{plateNumber}</Number>
    </CarNumber>
  );
}

function CompanyLink({ trailer, url }: LinkProps ) {
  const companyName = trailer && trailer.spedition_company ? trailer.spedition_company : '';

  if (companyName != '')
      return (
      <CompanyPlate to={url}>
        <Company>{companyName}</Company>
      </CompanyPlate>
    );
  else
    return (
        <Container/>
    );
}

function RefreshContainer({ trailer, readTrailerState }: ReadProps) {

    useEffect(() => {
      if (trailer && readTrailerState && iconUpdaterID != trailer.id) {
        if (iconUpdater) {
          clearInterval(iconUpdater);
        }
        iconUpdater = setInterval(() => {
          readTrailerState(trailer.id);
        }, 10 * 1000);
        iconUpdaterID = trailer.id;
      }
    });

    return (
      <Container trailer={trailer}>
        <CarEngineRunning trailer={trailer} />
        <CarNetworkAvailable trailer={trailer} />
      </Container>
  )
}

function CarEngineRunning({ trailer}: IconProps) {
  const engineRunning = trailer && trailer.engine_running;

  if (engineRunning)
    return (
      <PictoWrapper>
        <PictureStatus src={engineOn} />
      </PictoWrapper>
    );
  else
    return (
        <PictoWrapper>
          <PictureStatus src={engineOff} />
        </PictoWrapper>
    );

}

function CarNetworkAvailable({ trailer}: IconProps) {
  const networkAvailable = trailer && trailer.network_available;
  const networkLevel = trailer?.position.signal ? trailer?.position.signal : 25;

  const { t } = useTranslation();

  // FIXME refactor the rendering to avoid duplicate code - after the logic is accepted.
  if (networkAvailable)
    if (networkLevel >= 22) // -70dBm or higher
       return (
          <PictoWrapper>
            <Tooltip content={t`signal_excellent`}>
              <PictureStatus src={network25_31} />
            </Tooltip>
          </PictoWrapper>
      );
    else if (networkLevel >= 14) // -85dBm or higher
      return (
          <PictoWrapper>
            <Tooltip content={t`signal_good`}>
              <PictureStatus src={network17_24} />
            </Tooltip>
          </PictoWrapper>
      );
    else if (networkLevel >= 7) // -99dBm or higher
      return (
          <PictoMessageWrapper>
            <Tooltip content={t`signal_poor`}>
              <PictureStatus src={network9_16} />
            </Tooltip>
            <InfoWarning>{t`network_slow`}</InfoWarning>
          </PictoMessageWrapper>
      );
    else // -100 dBm or lower.
      return (
          <PictoMessageWrapper>
            <Tooltip content={t`signal_marginal`}>
              <PictureStatus src={network1_8} />
            </Tooltip>
            <InfoWarning>{t`network_slow`}</InfoWarning>
          </PictoMessageWrapper>
      );
  else
    return (
        <PictoMessageWrapper>
          <PictureStatus src={networkOff} />
          <InfoNotActual>{t`info_inactual`}</InfoNotActual>
        </PictoMessageWrapper>
    );

}

function getState(trailer: Trailer, state: TrailerStates, setTo: TrailerStates = TrailerStates.ok) {
  return trailer.state === state ? setTo : state;
}

function TrailersContent({ trailer, setTrailerState, openAlarmModal, openArmModal }: StatusButtonProps) {
  let buttons = [];
  const alarmControlAllowed = trailer.permission.alarmControl;

  switch (trailer.state) {
    case TrailerStates.startLoading:
      buttons.push(
        <ArmButton key="arm" trailer={trailer} openArmModal={openArmModal} setTrailerState={setTrailerState} />,
      );
      buttons.push(<StopLoadingButton key="stop-loading" trailer={trailer} setTrailerState={setTrailerState} />);
      buttons.push(
        <AlertButton
          key="alert"
          trailer={trailer}
          openAlarmModal={openAlarmModal}
          setTrailerState={setTrailerState}
          alarmControlAllowed={alarmControlAllowed}
        />,
      );
      break;
    case TrailerStates.endLoading:
      buttons.push(
        <ArmButton key="arm" trailer={trailer} openArmModal={openArmModal} setTrailerState={setTrailerState} />,
      );
      buttons.push(<StartLoadingButton key="start-loading" trailer={trailer} setTrailerState={setTrailerState} />);
      buttons.push(
        <AlertButton
          key="alert"
          trailer={trailer}
          openAlarmModal={openAlarmModal}
          setTrailerState={setTrailerState}
          alarmControlAllowed={alarmControlAllowed}
        />,
      );
      break;
    case TrailerStates.alarm:
      buttons.push(
        <EmergencyButton
          key="alert"
          trailer={trailer}
          setTrailerState={setTrailerState}
          alarmControlAllowed={alarmControlAllowed}
        />,
      );
      buttons.push(
        <SilenceAlarmButton
          key="silence"
          trailer={trailer}
          setTrailerState={setTrailerState}
          alarmControlAllowed={alarmControlAllowed}
        />,
      );
      buttons.push(
        <ResolveAlarmButton
          key="resolve"
          trailer={trailer}
          setTrailerState={setTrailerState}
          alarmControlAllowed={alarmControlAllowed}
        />,
      );
      break;
    case TrailerStates.silenced:
      buttons.push(
        <AlertButton
          key="alert"
          trailer={trailer}
          openAlarmModal={openAlarmModal}
          setTrailerState={setTrailerState}
          alarmControlAllowed={alarmControlAllowed}
        />,
      );
      buttons.push(
        <ResolveAlarmButton
          key="resolve"
          trailer={trailer}
          setTrailerState={setTrailerState}
          alarmControlAllowed={alarmControlAllowed}
        />,
      );
      break;
    case TrailerStates.off:
      buttons.push(
        <ArmButton key="arm" trailer={trailer} openArmModal={openArmModal} setTrailerState={setTrailerState} />,
      );
      buttons.push(<StartLoadingButton key="start-loading" trailer={trailer} setTrailerState={setTrailerState} />);
      buttons.push(
        <AlertButton
          key="alert"
          trailer={trailer}
          openAlarmModal={openAlarmModal}
          setTrailerState={setTrailerState}
          alarmControlAllowed={alarmControlAllowed}
        />,
      );
      break;
    case TrailerStates.armed:
      buttons.push(<DisarmButton key="disarm" trailer={trailer} setTrailerState={setTrailerState} />);
      buttons.push(<StartLoadingButton key="start-loading" trailer={trailer} setTrailerState={setTrailerState} />);
      buttons.push(
        <AlertButton
          key="alert"
          trailer={trailer}
          openAlarmModal={openAlarmModal}
          setTrailerState={setTrailerState}
          alarmControlAllowed={alarmControlAllowed}
        />,
      );
      break;
    case TrailerStates.disarmed:
      buttons.push(
        <ArmButton key="arm" trailer={trailer} openArmModal={openArmModal} setTrailerState={setTrailerState} />,
      );
      buttons.push(<StartLoadingButton key="start-loading" trailer={trailer} setTrailerState={setTrailerState} />);
      buttons.push(
        <AlertButton
          key="alert"
          trailer={trailer}
          openAlarmModal={openAlarmModal}
          setTrailerState={setTrailerState}
          alarmControlAllowed={alarmControlAllowed}
        />,
      );
      break;
    case TrailerStates.quiet:
      buttons.push(
        <AlertButton
          key="alert"
          trailer={trailer}
          openAlarmModal={openAlarmModal}
          setTrailerState={setTrailerState}
          alarmControlAllowed={alarmControlAllowed}
        />,
      );
      buttons.push(
        <ResolveAlarmButton
          key="resolve"
          trailer={trailer}
          setTrailerState={setTrailerState}
          alarmControlAllowed={alarmControlAllowed}
        />,
      );
      break;
    case TrailerStates.emergency:
      buttons.push(
        <SilenceAlarmButton
          key="silence"
          trailer={trailer}
          setTrailerState={setTrailerState}
          alarmControlAllowed={alarmControlAllowed}
        />,
      );
      buttons.push(
        <ResolveAlarmButton
          key="resolve"
          trailer={trailer}
          setTrailerState={setTrailerState}
          alarmControlAllowed={alarmControlAllowed}
        />,
      );
      break;
    case TrailerStates.warning:
    case TrailerStates.ok:
    case TrailerStates.truckBatteryNormal:
    case TrailerStates.truckBatteryLow:
    case TrailerStates.shutdownImmediate:
    case TrailerStates.shutdownPending:
    case TrailerStates.truckConnected:
    case TrailerStates.truckDisconnected:
    case TrailerStates.truckEngineOn:
    case TrailerStates.truckEngineOff:
    case TrailerStates.truckParkingOn:
    case TrailerStates.truckParkingOff:
    case TrailerStates.unknown:
      buttons.push(
        <ArmButton key="arm" trailer={trailer} openArmModal={openArmModal} setTrailerState={setTrailerState} />,
      );
      buttons.push(<StartLoadingButton key="start-loading" trailer={trailer} setTrailerState={setTrailerState} />);
      buttons.push(
        <AlertButton
          key="alert"
          trailer={trailer}
          openAlarmModal={openAlarmModal}
          setTrailerState={setTrailerState}
          alarmControlAllowed={alarmControlAllowed}
        />,
      );
      break;
  }

  return <>{buttons}</>;
}

function onArmedButtonClick(
  trailer: Trailer,
  isContextMenuOpen: boolean,
  setIsContextMenuOpen: React.Dispatch<React.SetStateAction<boolean>>,
  setTrailerState: (id: TrailerId, status: TrailerStates) => void,
) {
  if (!(trailer.state === TrailerStates.armed)) {
    setIsContextMenuOpen(!isContextMenuOpen);
  } else if (!isContextMenuOpen) {
    setTrailerState(trailer.id, getState(trailer, TrailerStates.armed));
  }
}

const ArmButton = ({ trailer, openArmModal, setTrailerState }: StatusButtonProps) => {
  const { t } = useTranslation();
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
  return (
    <NeutralButton
      text={t`system_set_armed`}
      active={false}
      onClick={() => onArmedButtonClick(trailer, isContextMenuOpen, setIsContextMenuOpen, setTrailerState)}
    >
      {isContextMenuOpen && !(trailer.state === TrailerStates.armed) && (
        <ContextMenu>
          <ContextButton
            text={t`without_cameras`}
            onClick={() => setTrailerState(trailer.id, getState(trailer, TrailerStates.armed))}
          />
          <ContextButton
            text={t`with_cameras`}
            onClick={() =>
              openArmModal({
                trailer,
                getArmedStatus: trailer => getState(trailer, TrailerStates.armed),
                setTrailerState,
              })
            }
          />
        </ContextMenu>
      )}
    </NeutralButton>
  );
};

const DisarmButton = ({ trailer, setTrailerState }: AlertButtonProps) => {
  const { t } = useTranslation();
  return (
    <NeutralButton
      text={t`system_set_disarmed`}
      active={true}
      onClick={() => setTrailerState(trailer.id, TrailerStates.disarmed)}
    />
  );
};

const StartLoadingButton = ({ trailer, setTrailerState }: AlertButtonProps) => {
  const { t } = useTranslation();
  return (
    <NeutralButton
      text={t`loading_set_on`}
      active={false}
      onClick={() => setTrailerState(trailer.id, getState(trailer, TrailerStates.startLoading))}
    />
  );
};

const StopLoadingButton = ({ trailer, setTrailerState }: AlertButtonProps) => {
  const { t } = useTranslation();
  return (
    <NeutralButton
      text={t`loading_set_off`}
      active={true}
      onClick={() => setTrailerState(trailer.id, getState(trailer, TrailerStates.endLoading))}
    />
  );
};

const EmergencyButton = ({ trailer, setTrailerState, alarmControlAllowed }: AlertButtonProps) => {
  if (!alarmControlAllowed) {
    return <></>;
  }
  const { t } = useTranslation();
  return (
    <Alert active={false} onClick={() => setTrailerState(trailer.id, TrailerStates.emergency)}>
      {t`emergency_call`}
    </Alert>
  );
};

const AlertButton = ({ trailer, openAlarmModal, setTrailerState, alarmControlAllowed }: AlertButtonProps) => {
  if (!alarmControlAllowed) {
    return <></>;
  }
  const { t } = useTranslation();
  return (
    <Alert
      active={false}
      onClick={() =>
        openAlarmModal &&
        openAlarmModal({
          trailer,
          getAlertStatus: trailer => getState(trailer, TrailerStates.alarm, TrailerStates.silenced),
          setTrailerState,
        })
      }
    >
      {t`alarm_set_on`}
    </Alert>
  );
};

const SilenceAlarmButton = ({ trailer, setTrailerState, alarmControlAllowed }: AlertButtonProps) => {
  if (!alarmControlAllowed) {
    return <></>;
  }
  const { t } = useTranslation();
  return (
    <Alert active onClick={() => setTrailerState(trailer.id, TrailerStates.silenced)}>
      {t`alarm_set_silenced`}
    </Alert>
  );
};

const ResolveAlarmButton = ({ trailer, setTrailerState, alarmControlAllowed }: AlertButtonProps) => {
  if (!alarmControlAllowed) {
    return <></>;
  }
  const { t } = useTranslation();
  const isActive = !(TrailerStates.off === trailer.state);
  return (
    <Resolve
      active={isActive}
      onClick={() => isActive && setTrailerState(trailer.id, getState(trailer, TrailerStates.off))}
    >
      {isActive ? t`alarm_set_off` : t`alarm_resolved`}
    </Resolve>
  );
};

function NeutralButton(props: NeutralButtonProps) {
  const { children, active, text, onClick } = props;
  return (
    <StatusButton active={active} onClick={onClick}>
      <StatusText>{text}</StatusText>
      <Lightbulb active={active} />
      {children}
    </StatusButton>
  );
}

function ContextButton(props: ContextButtonProps) {
  const { text, onClick } = props;
  return (
    <ContextStatusButton onClick={onClick}>
      <ContextStatusText>{text}</ContextStatusText>
    </ContextStatusButton>
  );
}

function SensorsBreadcrumb({ match }: RouteComponentProps<{ sensorId: string }>) {
  const sensorId = snakeToCamel(match.params.sensorId);
  const { t } = useTranslation();
  if (!SensorTypes.isSensorType(sensorId)) {
    return <Chevron />;
  }
  return (
    <>
      <Chevron />
      <Breadcrumb>{t(SensorTypes.toReadableName(sensorId))}</Breadcrumb>
    </>
  );
}

function EventsBreadcrumb() {
  const { t } = useTranslation('events');
  return (
    <>
      <Chevron />
      <Breadcrumb>{t`history`}</Breadcrumb>
    </>
  );
}

const Lightbulb = ({ active }: { active: boolean }) => {
  return (
    <LightbulbOutlineIcon
      color={'#ffffff'}
      backgroundColor={active ? '#5ea90f' : '#a0a0a0'}
      active={true}
      wrapperSize={35}
      iconSize={20}
    />
  );
};

const Chevron = () => {
  return (
    <ChevronRightIcon color={'#000000'} backgroundColor={'transparent'} active={false} wrapperSize={25} iconSize={25} />
  );
};

const Container = styled.div`
  margin: 0px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
`;

const VContainer = styled.div`
  margin: 0px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: left;
`;

const CarNumber = styled(Link)`
  margin: 8px;
  min-width: 225px;
  display: flex;
  flex-direction: row;
  border: 3px solid #000000;
  border-radius: 4px;
  text-decoration: none;
  color: #000000;
  cursor: pointer;
`;

const CompanyPlate = styled(Link)`
  margin: 8px;
  min-width: 225px;
  display: flex;
  flex-direction: row;
  border: 3px solid #87CEFA;
  border-radius: 2px;
  text-decoration: none;
  color: #87CEFA;
  cursor: pointer;
`;

const InfoNotActual = styled.div`
  margin: 8px;
  max-width: 200px; 
  display: flex;
  flex-direction: row;
  border: 3px solid #d75d30;
  border-radius: 4px;
  justify-content: center;
  align-items: center;
  text-align: center;
  text-decoration: none;
  color: #d75d30;
  cursor: pointer;
`;

const InfoWarning = styled.div`
  margin: 8px;
  max-width: 200px; 
  display: flex;
  flex-direction: row;
  border: 3px solid #da982d;
  border-radius: 4px;
  justify-content: center;
  align-items: center;
  text-align: center;
  text-decoration: none;
  color: #da982d;
  cursor: pointer;
`;

const PictoWrapper = styled.div`
  width: 58px;
  height: 58px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const PictoMessageWrapper = styled.div`
  width: 258px;
  height: 58px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const PictureStatus = styled.img`
  width: 50px;
  height: 50px;
  object-fit: cover;
`;

const CountryCode = styled.span`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #2b6bb6;
`;

const FlagWrapper = styled.div`
  width: 28px;
  height: 28px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Flag = styled.img`
  width: 20px;
  height: 20px;
  object-fit: cover;
`;

const Country = styled.div`
  font-size: 12px;
  font-weight: 700;
  line-height: 1.7;
  text-align: center;
  color: #ffffff;
  background-color: #2b6bb6;
`;

const Number = styled.span`
  padding-left: 17px;
  padding-right: 17px;
  min-width: 153px;
  width: 100%;
  font-size: 34px;
  font-weight: 600;
  line-height: 1.4;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #ffffff;
`;

const Company = styled.span`
  padding-left: 17px;
  padding-right: 17px;
  min-width: 153px;
  width: 100%;
  font-size: 34px;
  font-weight: 600;
  line-height: 1.4;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #00008B;
`;

const ContextMenu = styled.div`
  position: absolute;
  bottom: -98px;
  left: -9px;
`;

const StatusButton = styled.div`
  position: relative;
  margin: 8px;
  padding: 0;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  border-radius: 4px;
  background-color: ${({ active }: { active: boolean | null }) => (active ? '#5fa80f' : '#a0a0a0')};
  outline: none;
  cursor: pointer;
`;

const ContextStatusButton = styled.button`
  position: relative;
  margin: 8px;
  padding: 0;
  min-width: 210px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  border-radius: 4px;
  background-color: #a0a0a0;
  outline: none;
  cursor: pointer;
  z-index: 10000;
`;

const StatusText = styled.span`
  padding-top: 7px;
  padding-bottom: 7px;
  padding-left: 15px;
  padding-right: 15px;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.5;
  text-align: center;
  color: #ffffff;
  white-space: nowrap;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  border-right: 1px solid #ffffff;
  &::first-letter {
    text-transform: uppercase;
  }
`;

const ContextStatusText = styled(StatusText)`
  border: 0;
  z-index: 10000;
`;

const Alert = styled.button`
  margin: 8px;
  padding-top: 7px;
  padding-bottom: 7px;
  padding-left: 20px;
  padding-right: 20px;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.5;
  text-align: center;
  color: #ffffff;
  white-space: nowrap;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  background-color: ${({ active }: { active: boolean | null }) => (active ? '#e7b600' : '#d0021b')};
  border-radius: 4px;
  outline: none;
  cursor: pointer;
  &::first-letter {
    text-transform: uppercase;
  }
`;

const Resolve = styled(Alert)`
  background-color: ${({ active }: { active: boolean | null }) => (active ? '#5fa80f' : '#a0a0a0')};
`;

const Breadcrumb = styled.span`
  font-size: 20px;
  font-weight: 600;
  line-height: 1.25;
  color: #000000;
  text-transform: capitalize;
`;
