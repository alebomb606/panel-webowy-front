import React from 'react';
import { createRef } from 'react';
import { connect } from 'react-redux';
import { Dispatch, bindActionCreators } from 'redux';

import styled from '../theme';
import { AlarmAction } from '../events/types';
import { State } from '../store';
import { TrailerStates, TrailerPermissions } from '../trailers/types';
import { getPermission } from '../trailers/selectors';
import { resolveAlarm } from '../trailers/actions';
import { TrailerEventId } from '../events/reducer';
import { useTranslation } from 'react-i18next';

interface OwnProps {
  id: TrailerEventId;
  type: TrailerStates;
  interactions: AlarmAction[];
  onClick: () => void;
}

interface ResolveButtonProps {
  isResolvePermtted: boolean;
}

interface ResolveButtonActions {
  actions: {
    resolveAlarm: ActionProp<typeof resolveAlarm>;
  };
}

type Props = OwnProps & ResolveButtonProps & ResolveButtonActions;

function ResolveAlarmButton({ id, type, interactions, isResolvePermtted, onClick, actions }: Props) {
  const { t } = useTranslation();
  const buttonRef = createRef<HTMLButtonElement>();

  const isAlarm =
    type === TrailerStates.alarm ||
    type === TrailerStates.silenced ||
    type === TrailerStates.quiet ||
    type === TrailerStates.emergency;

  const isTurnedOff = interactions.some(interaction => interaction.type === TrailerStates.off);
  const isNotResolved = !interactions.some(interaction => interaction.type === TrailerStates.resolved);
  const canBeResolved = isAlarm && isTurnedOff && isNotResolved && isResolvePermtted && id;

  if (!canBeResolved) {
    return <></>;
  }
  const resolve = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
    if (e.target === buttonRef.current) {
      e.stopPropagation();
    }
    actions.resolveAlarm(id);
    setTimeout(onClick, 0);
  };

  const text = t`alarm_set_resolved`;

  return (
    <StyledButton ref={buttonRef} onClick={resolve} title={text}>
      {text}
    </StyledButton>
  );
}

const getResolvePermission = getPermission(TrailerPermissions.alarmResolveControl);

const mapStateToProps = (state: State): ResolveButtonProps => ({
  isResolvePermtted: getResolvePermission(state),
});

const mapDispatchToProps = (dispatch: Dispatch): ResolveButtonActions => ({
  actions: bindActionCreators({ resolveAlarm }, dispatch),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ResolveAlarmButton);

const StyledButton = styled.button`
  margin: 0 5px;
  padding-top: 5px;
  padding-bottom: 5px;
  padding-left: 20px;
  padding-right: 20px;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.25;
  text-align: center;
  color: #ffffff;
  white-space: nowrap;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  background-color: #5fa80f;
  border-radius: 4px;
  outline: none;
  cursor: pointer;
  &::first-letter {
    text-transform: uppercase;
  }
`;
