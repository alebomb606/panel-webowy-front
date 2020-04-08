import React from 'react';
import ReactDOM from 'react-dom';
import WebFont from 'webfontloader';

import App from './App';

WebFont.load({
  google: {
    families: ['IBM Plex Sans'],
  },
});

ReactDOM.render(<App />, app);
