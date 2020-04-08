import React, { createContext, useEffect } from 'react';
import { Cable, Channel, createConsumer } from 'actioncable';
import { State } from './store';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import jsonApi, { JsonApiResponse } from './utils/json-api';
import { TrailersActionTypes, mapTrailer, fetchTrailers } from './trailers/actions';
import { fetchSensors } from './sensors/actions';
import { fetchEvents, TrailerEventsActionTypes } from './events/actions';
import { fetchRoutes } from './routes/actions';
import { mapRawMedia, MonitoringActionTypes } from './monitoring/actions';

const wsURL = `wss://${process.env.REACT_APP_BACKEND_HOST}/cable?connection_type=frontend`;
const channel = 'Api::V1::AuthsChannel';

interface CableApp {
  cable?: Cable;
  network?: Channel;
}

export const cableApp: CableApp = {
  cable: undefined,
  network: undefined,
};

const { Provider } = createContext(cableApp.cable);

interface OwnProps {
  children: any;
}
interface ActionCableProviderProps {
  auth: State['auth'];
}

interface ActionCableProviderActions {
  dispatch: ThunkDispatch<State, null, Action>;
}

type Props = OwnProps & ActionCableProviderProps & ActionCableProviderActions;

const getAuthParms = (auth: State['auth']) => {
  if (auth.token && auth.client && auth.uid) {
    return new URLSearchParams({
      'access-token': auth.token,
      client: auth.client,
      uid: auth.uid,
    }).toString();
  }
  return undefined;
};

function actionCableDispatcher(dispatch: Props['dispatch']) {
  return {
    connected() {},
    disconnected() {},
    received(data: JsonApiResponse) {
      try {
        const type = (Array.isArray(data.data) ? data.data[0] : data.data).type;
        const message = jsonApi(data) as Array<any>;
        switch (type) {
          case 'trailer': {
            for (const element of message) {
              const trailer = mapTrailer(element);
              delete trailer.position;
              delete trailer.permission;
              dispatch({
                type: TrailersActionTypes.fetchTrailersSuccess,
                payload: { order: [], entities: { [trailer.id]: trailer } },
              });
              dispatch(fetchEvents(trailer.id));
            }
            break;
          }
          case 'trailer_event': {
            for (const element of message) {
              dispatch({
                type: TrailerEventsActionTypes.updateEvent,
                payload: element,
              });
            }
            dispatch(fetchEvents(undefined));
            break;
          }
          case 'trailer_sensor': {
            //FIXME use data from event instead of fetching from server again
            dispatch(fetchSensors(message[0]['trailer_id']));
          }
          case 'trailer_media': {
            for (const element of message) {
              if (element.status == 'completed') {
                dispatch({
                  type: MonitoringActionTypes.requestMediaSuccess,
                  payload: {
                    media: mapRawMedia(element),
                  },
                });
              }
            }
            break;
          }
          default: {
            for (const element of message) {
              if (element.status === 'alarm') {
                dispatch(fetchEvents(undefined));
                dispatch(fetchRoutes(element['trailer_id']));
                dispatch(fetchTrailers());
                break;
              }
            }
          }
        }
      } catch (err) {
        //FIXME properly handle error
        console.error(err);
      }
    },
  };
}

const ActionCableProvider = (props: Props) => {
  const { children, auth, dispatch } = props;

  useEffect(() => {
    const credentials = getAuthParms(auth);
    let cable: Cable | undefined = undefined;
    if (credentials) {
      cable = createConsumer(`${wsURL}&${credentials}`);
      const subscription = cable.subscriptions.create(channel, actionCableDispatcher(dispatch));
      cableApp.network = subscription;
      cableApp.cable = cable;
    }

    return () => {
      if (cable) {
        cable.disconnect();
        delete cableApp.cable;
      }
    };
  }, [auth]);

  return <Provider value={cableApp.cable}>{children}</Provider>;
};

const mapStateToProps = ({ auth }: State): ActionCableProviderProps => ({ auth });
const mapDispatchToProps = (dispatch: ThunkDispatch<State, null, Action>): ActionCableProviderActions => ({
  dispatch,
});

export default connect(mapStateToProps, mapDispatchToProps)(ActionCableProvider);
