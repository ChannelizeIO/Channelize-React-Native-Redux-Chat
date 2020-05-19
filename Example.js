import React, { Component } from 'react';
import { Provider } from 'react-redux';

import { App, ConversationList, ConversationWindow, store } from './src';
import { Channelize } from './channelize-websdk/dist/index';

if (process.env.NODE_ENV === 'development') {
  GLOBAL.XMLHttpRequest = GLOBAL.originalXMLHttpRequest || GLOBAL.XMLHttpRequest;
  console.disableYellowBox = true;
}

const PUBLIC_KEY; //Channelize.io public key
const LOGGEDIN_USER_ID;//User id of loggedin user
const CH_ACCESS_TOKEN; //Channelize access token of loggedin userid 

export default class Example extends Component {
  constructor(props) {
    super(props);

    this.state = {
      conversation: null
    }
  }

  componentDidMount() {
    console.log('app is launched');
  }

  componentWillUnmount() {
    console.log('app is killed');
  }

  render() {
    var client = new Channelize.client({publicKey: PUBLIC_KEY});

    return (
      <Provider store={store}>
        <App client={client} userId={LOGGEDIN_USER_ID} accessToken={CH_ACCESS_TOKEN}>
          <ConversationList />
          <ConversationWindow />
        </App>
      </Provider>
    );
  }
}
