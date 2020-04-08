import React from 'react';
import { useTranslation } from 'react-i18next';

import EventRow from '../../common/event-row';
import styled from '../../theme/index';
import { SensorEvent, SensorTypes } from '../../sensors/reducer';
import { TrailerStates } from '../../trailers/types';

interface SensorEventsListProps {
  events: SensorEvent[];
  sensorId: string;
}

export default function SensorEventsList(props: SensorEventsListProps) {
  const { events, sensorId } = props;
  const { t } = useTranslation();

  if (!events || !events.length) {
    return <NoHistory>{t`no_data`}</NoHistory>;
  }

  return (
    <HistoryList>
      {events.map(event => {
        const type = event.status;
        const color = TrailerStates.toColor(type);
        const name = t(`sensors:${sensorId}.critical`, {
          value: event.value,
          unit: SensorTypes.getSensorUnit(event.type),
        });
        const date = event.date;
        return (
          <EventRow
            key={event.id}
            type={type}
            color={color}
            name={name}
            date={date}
            interactions={[]}
            refreshList={() => {
              /* used when user resolves an event */
              /* so not on this list */
              /* but we want to keep this as a placeholder to be sure that other lists will use it */
            }}
          />
        );
      })}
    </HistoryList>
  );
}

const NoHistory = styled.div`
  max-width: 100%;
  max-height: 100%;
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 18px;
  font-weight: 500;
  line-height: 1.25;
  color: #a0a0a0;
  letter-spacing: 1.6;
`;

const HistoryList = styled.div`
  overflow-y: scroll;
  overflow-x: hidden;
`;
