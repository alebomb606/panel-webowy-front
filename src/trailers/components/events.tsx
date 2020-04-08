import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { Container, Header, HeaderWrapper } from './sensors';
import EventsList from './events-list';
import Loading from '../../common/loading';
import styled from '../../theme';
import { TrailerEvent } from '../../events/reducer';

interface EventsProps {
  loading: boolean;
  events: TrailerEvent[];
  error: Error | null;
  url: string;
  selectedTime: string;
  setEventTime: (date: Date) => void;
  refreshList: () => void;
}

export default function Events(props: EventsProps) {
  const { loading, events, selectedTime, error, url, setEventTime, refreshList } = props;
  const { t } = useTranslation('events');

  return (
    <EventsContainer>
      <HeaderWrapper>
        <Header>{t`history`}</Header>
        <DetailsLink to={`${url}/events/`}>{t`see_more`}</DetailsLink>
      </HeaderWrapper>
      <Loading loading={loading && events.length === 0} error={error}>
        <EventsList selectedTime={selectedTime} setEventTime={setEventTime} events={events} refreshList={refreshList} />
      </Loading>
    </EventsContainer>
  );
}

const EventsContainer = styled(Container)`
  height: 290px;
  box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.15);
`;

const DetailsLink = styled(Link)`
  margin-right: 15px;
  font-size: 10px;
  font-weight: 500;
  line-height: 1.3;
  letter-spacing: 2.2;
  text-align: center;
  color: #4390e5;
  text-align: right;
  text-transform: uppercase;
  text-decoration: none;
  background-color: transparent;
  border: none;
  outline: none;
  cursor: pointer;
`;
