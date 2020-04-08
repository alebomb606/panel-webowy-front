import { AuthActions } from './actions';

export enum AuthErrors {
  loginRequestFail = 'loginRequestFail',
  invalidateSession = 'invalidateSession',
}

export namespace AuthErrors {
  export function toReadableName(name: AuthErrors) {
    switch (name) {
      case AuthErrors.loginRequestFail:
        return 'AuthErrors.loginRequestFail';
      case AuthErrors.invalidateSession:
        return 'AuthErrors.invalidateSession';
    }
  }
}

export interface AuthState {
  token?: string;
  client?: string;
  uid?: string;
  login: string;
  password: string;
  error?: AuthErrors;
}

const initialState: AuthState = {
  login: '',
  password: '',
};

function reducer(state: AuthState = initialState, action: Action = { type: '' }): AuthState {
  switch (action.type) {
    case AuthActions.loginRequestSuccess:
      return {
        ...state,
        token: action.payload.headers['access-token'],
        client: action.payload.headers['client'],
        uid: action.payload.headers['uid'],
        password: '',
        error: undefined,
      };
    case AuthActions.invalidateSession:
      return {
        ...state,
        token: undefined,
        client: undefined,
        uid: undefined,
        password: '',
        error: AuthErrors.invalidateSession,
      };
    case AuthActions.loginRequestFail:
      return {
        ...state,
        token: undefined,
        client: undefined,
        uid: undefined,
        password: '',
        error: AuthErrors.loginRequestFail,
      };
    case AuthActions.logoutRequestSuccess:
      return {
        ...state,
        token: undefined,
        client: undefined,
        uid: undefined,
        login: '',
        password: '',
        error: undefined,
      };
    case AuthActions.loginRequestFail:
      return {
        ...state,
        token: undefined,
        client: undefined,
        uid: undefined,
        login: '',
        password: '',
        error: undefined,
      };
    case AuthActions.updatePassword:
      return {
        ...state,
        password: action.payload.password,
      };
    case AuthActions.updateLogin:
      return {
        ...state,
        login: action.payload.login,
      };
    default:
      return state;
  }
}

export default reducer;
