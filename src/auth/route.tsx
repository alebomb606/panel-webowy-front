import React from 'react';
import { connect } from 'react-redux';
import { Route, Redirect, RouteProps, RouteComponentProps } from 'react-router-dom';

import { State } from '../store';
import { AuthState } from './reducer';

interface AuthRouteProps extends RouteProps {
  auth: AuthState;
}

function AuthRoute(props: AuthRouteProps) {
  const { auth, component = <></>, ...rest } = props;
  const Component = component as React.ComponentClass<RouteComponentProps>;
  return (
    <Route
      {...rest}
      render={props =>
        auth.token && Component ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={{
              pathname: '/login',
              state: { from: props.location },
            }}
          />
        )
      }
    />
  );
}

const mapStateToProps = ({ auth }: State) => ({ auth });

const connected = connect(mapStateToProps)(AuthRoute);

export default connected as React.ComponentClass<any>;
