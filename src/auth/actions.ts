import { Dispatch } from 'redux';

import { State } from '../store';
import api from '../api';

export enum AuthActions {
  updateLogin = 'AuthActions.updateLogin',
  updatePassword = 'AuthActions.updatePassword',
  invalidateSession = 'AuthActions.invalidateSession',
  loginRequestSent = 'AuthActions.loginRequestSent',
  loginRequestSuccess = 'AuthActions.loginRequestSuccess',
  loginRequestFail = 'AuthActions.loginRequestFail',
  logoutRequestSent = 'AuthActions.logoutRequestSent',
  logoutRequestSuccess = 'AuthActions.logoutRequestSuccess',
  logoutRequestFail = 'AuthActions.logoutRequestFail',
}

export function updateLogin(login: string) {
  return { type: AuthActions.updateLogin, payload: { login } };
}

export function updatePassword(password: string) {
  return { type: AuthActions.updatePassword, payload: { password } };
}

export function login() {
  return async function(dispatch: Dispatch, getState: () => State) {
    dispatch({ type: AuthActions.loginRequestSent });
    try {
      const { auth } = getState();
      const { data, headers } = await api.login({ email: auth.login, password: auth.password });
      dispatch({ type: AuthActions.loginRequestSuccess, payload: { data, headers } });
    } catch (error) {
      dispatch({ type: AuthActions.loginRequestFail, error: true, payload: { error } });
    }
  };
}

export function logout() {
  return async function(dispatch: Dispatch, getState: () => State) {
    dispatch({ type: AuthActions.logoutRequestSent });
    try {
      const { auth } = getState();
      await api.logout({ auth });
      dispatch({ type: AuthActions.logoutRequestSuccess, payload: null });
    } catch (error) {
      dispatch({ type: AuthActions.logoutRequestFail, error: true, payload: { error } });
    }
  };
}
