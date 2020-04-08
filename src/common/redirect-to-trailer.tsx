import React, { ReactNode } from 'react';
import { RouteProps, Route, Redirect } from 'react-router';

import { TrailerId } from '../trailers/reducer';

export default function RedirectToTrailer(
  props: { active: TrailerId | null; order: TrailerId[]; children: ReactNode } & RouteProps,
) {
  const id = props.active || props.order[0];
  return (
    <Route
      render={routeProps => {
        if (id && !routeProps.match.params.id) {
          return <Redirect to={`${routeProps.match.url}/${id}`} />;
        }
        return props.children;
      }}
    />
  );
}
