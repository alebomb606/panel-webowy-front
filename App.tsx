import 'react-datepicker/dist/react-datepicker.css';
import React from 'react';
import moment from 'moment';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { PersistGate } from 'redux-persist/integration/react';
import { Provider } from 'react-redux';
import { registerLocale, setDefaultLocale } from 'react-datepicker';
import { useTranslation } from 'react-i18next';

import ActionCableProvider from './src/ws';
import AuthRoute from './src/auth/route';
import Footer from './src/footer/container';
import LocationRoute from './src/location/container';
import LoginScreen from './src/auth/container';
import Navbar from './src/navbar/container';
import PeopleRoute from './src/people/container';
import { store, persistor } from './src/store';
import TrailerRoute from './src/trailers/container';
import Ui from './src/ui/container';
import WhatsnewRoute from './src/whatsnew/container';

import de from 'date-fns/locale/de';
import enGB from 'date-fns/locale/en-GB';
import 'moment/locale/de';
import 'moment/locale/en-gb';
import 'moment/locale/pl';
import './src/i18n';

declare global {
  interface Action {
    type: string;
    payload?: any;
    error?: boolean;
  }

  // get any action creator (sync or async) and change its declaration
  type ActionProp<
    F extends (...args: any[]) => any, // F is the type of given function
    R = void // R is expected return type (void by default)
  > = (
    ...args: Parameters<F> // leave args as originally declared
  ) => R; // and change its return type to one given as R
}

export default function App() {
  require('dotenv').config();
  registerLocale('de', de);
  registerLocale('en', enGB);
  const { i18n } = useTranslation();
  const lang = moment.locale(i18n.language);
  setDefaultLocale(lang);
  const routerBasename = `${process.env.REACT_APP_ROUTER_BASENAME}`;
  return (
    <Provider store={store}>
      <ActionCableProvider>
        <PersistGate loading={null} persistor={persistor}>
          <Router basename={routerBasename}>
            <>
              <Route component={Navbar} />
              <Switch>
                <AuthRoute path="/trailers/:id?" component={TrailerRoute} />
                <AuthRoute path="/map/:id?" component={LocationRoute} />
                <AuthRoute path="/whatsnew/" component={WhatsnewRoute} />
                <AuthRoute path="/people/" component={PeopleRoute} />
                <Route path="/login" component={LoginScreen} />
                {checkShows() && <Redirect from="/" to="/whatsnew" />}
                {!checkShows() && <Redirect from="/" to="/trailers" />}
              </Switch>
              <AuthRoute component={Footer} />
              <Route component={Ui} />
            </>
          </Router>
        </PersistGate>
      </ActionCableProvider>
    </Provider>
  );
}

function checkShows() {

  let whatsnewShown = getCookie("whatsnew0221showntimes");

  let date = new Date(Date.now() + 14 * 86400000);
  date = date.toUTCString();

  if (whatsnewShown !== undefined) {
    if (Number(whatsnewShown) < 6) {
      whatsnewShown = Number(whatsnewShown).valueOf() + 1;
      setCookie("whatsnew0221showntimes", whatsnewShown.toString(), {expires: date});
      return true;
    } else {
      setCookie("whatsnew0221showntimes", whatsnewShown.toString(), {expires: date});
      return false;
    }
  } else {
    setCookie("whatsnew0221showntimes", Number(1).valueOf().toString(), {expires: date});
    return true;
  }
}

function getCookie(name) {
  let matches = document.cookie.match(new RegExp(
      "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
  ));
  return matches ? decodeURIComponent(matches[1]) : undefined;
}

function setCookie(name, value, options = {}) {
  options = {
    ...options
  };

  if (options.expires !== undefined) {
    if (options.expires.toUTCString) {
      options.expires = options.expires.toUTCString();
      console.log(option.expires);
    }
  }

  let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);

  for (let optionKey in options) {
    updatedCookie += "; " + optionKey;
    let optionValue = options[optionKey];
    if (optionValue !== true) {
      updatedCookie += "=" + optionValue;
    }
  }

  document.cookie = updatedCookie;
}

function deleteCookie(name) {
  setCookie(name, "", {
    'max-age': -1
  })
}