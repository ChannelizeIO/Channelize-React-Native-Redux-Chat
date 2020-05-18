import React, { useEffect, useState, Component } from 'react';
import { Provider } from 'react-redux';

import { store } from './src/store';
import App from './src/components/App';
import ConversationWindow from './src/components/ConversationWindow';
import ConversationList from './src/components/ConversationList';
import { Channelize } from './channelize-websdk/dist/index';
// import React, { useEffect } from 'react';

if (process.env.NODE_ENV === 'development') {
  GLOBAL.XMLHttpRequest = GLOBAL.originalXMLHttpRequest || GLOBAL.XMLHttpRequest;
  console.disableYellowBox = true;
}

const PUBLIC_KEY = "qHvonVEyIxDLa6zh"; //Channelize.io public key
const LOGGEDIN_USER_ID = "20697" ;//User id of loggedin user
const CH_ACCESS_TOKEN = "IM8At4OKh7lqDWZWWxJd6YtK5VWheqiYg5rttJgA9gG3PKVbDG2IbI9BQn2ihZu0"; //Channelize access token of loggedin userid 
const ANOTHER_USER_ID = "18859"; //The user id of another user to start chat

export default (props) => {
  const [conversation, setConversation] = useState('');

  const client = new Channelize.client({publicKey: PUBLIC_KEY});

  // let conversation;
  useEffect(() => {
    console.log('1111');
      getConversation();
  }, []);

  const getConversation = async () => {
    console.log('2222');
      const res = await client.connect(LOGGEDIN_USER_ID, CH_ACCESS_TOKEN);
      console.log('res', res)
      const conversation = await client.Conversation.getConversation('1021')
      setConversation(conversation);
    };

  if (!conversation) {
    return null;
  }

  return (
    <Provider store={store}>
      <App client={client} userId={LOGGEDIN_USER_ID} accessToken={CH_ACCESS_TOKEN}>
        <ConversationWindow conversation={conversation}/>
      </App>
    </Provider>
  )
}
