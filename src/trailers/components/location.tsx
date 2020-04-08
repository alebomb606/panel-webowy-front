import React, { ReactNode } from 'react';

import Loading from '../../common/loading';
import MapPanel from '../../common/map-panel';
import styled from '../../theme';
import { Trailer } from '../reducer';

interface Props {
  loading: boolean;
  error: Error | null;
  trailer: Trailer | null;
  children?: ReactNode;
}

export default function Location({ loading, error, trailer, children }: Props) {
  const trailers = [];
  if (trailer) {
    trailers.push(trailer);
  }
  return (
    <Container>
      <Loading error={error} loading={loading}>
        <MapPanel trailers={trailers} />
        {children}
      </Loading>
    </Container>
  );
}

const Container = styled.div`
  position: relative;
  margin: 8px;
  height: 245px;
  background-color: #ffffff;
`;
