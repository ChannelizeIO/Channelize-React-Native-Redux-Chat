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

  For react native >= 0.60

   ```
    npm install

   ```

   For react native < 0.60

```
   npm install
   react-native link react-native-vector-icons
   react-native link react-native-image-picker
   react-native link react-native-google-places
   react-native link rn-fetch-blob
   react-native link react-native-gesture-handler
   react-native link react-native-reanimated
   react-native link react-native-screens
   react-native link react-native-safe-area-context
   react-native link @react-native-community/masked-view
```

4. Additional package specific changes

- 1) As per react navigation documentation add the following at the top (make sure it's at the top and there's nothing else before it) of your entry file, such as index.js or App.js: 

https://reactnavigation.org/docs/getting-started/
https://github.com/ChannelizeIO/Channelize-React-Native-Redux-Chat/blob/feature/add-remaining-screens/Example.js


```
import 'react-native-gesture-handler';
```

- 2) There are few Node core modules like `buffer` which needs react native compatibility. Just require (or import) the below module in your app before anything else. 

https://www.npmjs.com/package/node-libs-react-native
https://github.com/ChannelizeIO/Channelize-React-Native-Redux-Chat/blob/feature/add-remaining-screens/index.js

```
import 'node-libs-react-native/globals'
``` 

Add a metro.config.js file in the root directory of your React Native project and set resolver.extraNodeModules

```
let nodeLibs = require('node-libs-react-native');
nodeLibs.fs = require.resolve('react-native-level-fs');
nodeLibs.tls = require.resolve('node-libs-react-native/mock/tls');;

// metro.config.js
module.exports = {
  resolver: {
    extraNodeModules: nodeLibs,
  },
};
```
- 3) There is `crypto` package which is used needs implementation of `getRandomValues` for React Native. Just require (or import) the below module in your app before anything else. 

https://www.npmjs.com/package/react-native-get-random-values
https://github.com/ChannelizeIO/Channelize-React-Native-Redux-Chat/blob/feature/add-remaining-screens/index.js

```
import 'react-native-get-random-values'
```

5. Add required config values `src/config.js` file.

6. **For Android**: (Please see all the steps in detail in [React native doc](https://reactnative.dev/docs/environment-setup)) 
   - a) Install Android Studio (https://developer.android.com/studio/index.html)
   - b) Install Android SDK
   - c) Configure the ANDROID_HOME environment variable
   - d) There are few permissions which you need to provide in `AndroidManifest.xml`

 ```
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
  ```

   - e) The `react-native-google-places` package require to set `RNGP_ANDROID_API_KEY` key with google api key.
   - f) Connect Android device or Virtual device to Android Studio
    
  **Note for Android:**
There are few dependencies such as `react-native-google-places` don't have AndroidX support. But an awesome tool named [jetifier](https://github.com/mikehardy/jetifier) is quite useful to patch these dependencies with AndroidX support.

7. Run the react native application by following commands:

```
   npm run start
   npm run android
   npm run ios

```

## Issues:
The npm dependencies also include the below npm native packages which has native code /module. 

If you face any issue regarding these packages, please visit the respective package documentations:

- 1) react-native-vector-icons (https://www.npmjs.com/package/react-native-vector-icons)
- 2) react-native-image-picker (https://www.npmjs.com/package/react-native-image-picker)
- 3) react-native-google-places (https://www.npmjs.com/package/react-native-google-places)
- 4) @react-navigation (https://reactnavigation.org/docs/getting-started)
- 5) rn-fetch-blob (https://www.npmjs.com/package/rn-fetch-blob)


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
