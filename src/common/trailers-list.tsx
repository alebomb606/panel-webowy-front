import React from 'react';

import Loading from './loading';
import { RouteComponentProps } from 'react-router';
import Search from '../trailers/components/search';
import styled from '../theme';
import Trailer from './trailer-row';
import { TrailerId, TrailersState } from '../trailers/reducer';

interface TrailersContainerProps {
  trailers: TrailersState;
  onTrailerClick: (id: TrailerId) => void;
  updateQuery: (query: string) => void;
  match: RouteComponentProps['match'];
}

export default function TrailersList(props: TrailersContainerProps) {
  const { trailers, onTrailerClick, updateQuery, match } = props;
  const list = trailers.order.map((id: TrailerId) => (
    <div key={id}>
      <Trailer
        key={id}
        selected={id === trailers.active}
        onClick={() => onTrailerClick(id)}
        trailer={trailers.entities[id]}
        url={match.path}
      />
    </div>
  ));

  return (
    <Container>
      <Search query={trailers.query} updateQuery={updateQuery} />
      <Loading error={trailers.error} loading={trailers.loading && list.length === 0}>
        <ListWrapper>{list}</ListWrapper>
      </Loading>
    </Container>
  );
}

const Container = styled.div`
  position: relative;
  min-width: 280px;
  width: 280px;
  background-color: #ffffff;
  box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.1);
  overflow-x: hidden;
`;

const ListWrapper = styled.div`
  min-width: 100%;
  position: absolute;
  top: 70px;
  right: 0;
  bottom: 0;
  left: 0;
  overflow-x: hidden;
  overflow-y: scroll;
  background-color: #ffffff;
`;
