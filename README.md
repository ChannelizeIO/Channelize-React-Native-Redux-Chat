# React Native Redux UI Kit For [Channelize.io](https://channelize.io)

This is react native redux UI Kit using Channelize.io Javascript SDKs. https://docs.channelize.io/react-native-redux

## Setup
1. Git clone
```
git clone https://github.com/ChannelizeIO/Channelize-React-Native-Redux-Chat
```

2. Install React Native CLI
  ```
npm install -g react-native-cli
  ```
3. Install npm dependencies
```
npm install
```
4. **For Android**: (Please see all the steps in detail in [React native doc](https://reactnative.dev/docs/environment-setup)) 
   a) Install Android Studio (https://developer.android.com/studio/index.html)
   b) Install Android SDK
   c) Configure the ANDROID_HOME environment variable
   d) Connect Android device or Virtual device to Android Studio

5. Run the react native application by following commands:

```
   npm run start
   npm run android
   npm run ios

```

## Components
### App

This is the application component which combines all the components and takes Javascript SDK client object as prop and pass this object to all all children components as props.

### ConversationList

This component is for listing of all the conversations with a better UI. Moreover when you select a conversation, you will be navigated to `ConversationWindow` component.

### ConversationWindow
This component is for displaying, conversation header, message listing and message input box with a better UI. The conversation window supports `conversation` and `userId` props.

If you pass `userId` prop, the component get conversation from userId and render message list.

If you pass `conversation` prop, the component will render the message list of the input conversation.

### Avatar
This component renders the image and background color with initials.

### ChannelizeProvider
This is a context provider which stores the Javascript SDk `client` object in provider's `value` prop and pass client object to all children components.

### withChannelizeContext
This is a higher order function which takes component in input, merge the context data with the input component props and return the component. This function is used to access the context data in component.

## Add components in your react native application
To add the components, you need channelize public key and access token which can explore more [here](https://docs.channelize.io/platform-api-authentication-public/)

## Multiple conversations with conversation window

 To add the components, you need channelize public key and access token which can explore more [here](https://docs.channelize.io/platform-api-authentication-public/)

```
import { App, ConversationList, ConversationWindow, store } from './src';
// You can use your store file also

import { Channelize } from 'channelize-chat';
import { Provider } from 'react-redux';

export default = (props) => {
    var client = new Channelize.client({publicKey: PUBLIC_KEY});

    return (
        <Provider store={store}>
            <App client={client} userId={LOGGEDIN_USER_ID} accessToken={CH_ACCESS_TOKEN}>
                <ConversationList />
                <ConversationWindow />
            </App>
        </Provider>
    )
}
```

## Conversation window `userId` prop

```
import { App, ConversationWindow, store } from './src';
// You can use your store file also

import { Channelize } from 'channelize-chat';
import { Provider } from 'react-redux';

export default (props) => {
    var client = new Channelize.client({publicKey: PUBLIC_KEY});

    return (
        <Provider store={store}>
            <App client={client} userId={LOGGEDIN_USER_ID} accessToken={CH_ACCESS_TOKEN}>
                <ConversationWindow userId={USER_ID}/>
            </App>
        </Provider>
    )
}
```

## Conversation window `conversation` prop

```
import React, { useEffect, useState } from 'react';
import { App, ConversationWindow, store } from './src';
// You can use your store file also

import { Channelize } from 'channelize-chat';
import { Provider } from 'react-redux';

export default (props) => {
    const [conversation, setConversation] = useState('');

    const client = new Channelize.client({publicKey: PUBLIC_KEY});

    useEffect(() => {
        getConversation();
    }, []);

    const getConversation = async () => {
        const res = await client.connect(USER_ID, ACCESS_TOKEN);
        const conversation = await client.Conversation.getConversation(CONVERSATION_ID)
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
```
## How to add UI Kit into your existing app
Please follow the below steps to add UI kit into your existing app:
1. Git clone the UI kit repository in a folder of your project's root directory.
2. If you are already using Redux, then import all reducers from UI kit to your application's root reducer file.
3. If you are not using Redux, then import `store` from UI kit in your application and pass `store` in `Redux Provider` before using `App`component of UI Kit as you can see in the above examples.
4. See UI kit's package.json file and add the missing packages in your project's package.json file.
5. Start using UI kit's components in your application component as you can see in the above examples.
