# React Native Redux UI Kit For [Channelize.io](https://channelize.io)

This is react native redux UI Kit using Channelize.io Javascript SDKs. https://docs.channelize.io/react-native-redux

## Contents

- [Setup](#setup)
- [Components](#components)
- [Themes](#themes)
- [How to add UI Kit into your existing app](#how-to-add-uI-kit-into-your-existing-app)
- [Issues](#issues)

## Setup
1. **Git clone**
```
git clone https://github.com/ChannelizeIO/Channelize-React-Native-Redux-Chat
```

2. **Install React Native CLI**
  ```
  npm install -g react-native-cli
  ```
3. **Install dependencies**

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

4. **Additional package specific changes**

      - As per react navigation documentation add the following at the top (make sure it's at the top and there's nothing else 
         before it) of your entry file, such as index.js or App.js: 

          https://reactnavigation.org/docs/getting-started/
          https://github.com/ChannelizeIO/Channelize-React-Native-Redux-Chat/blob/feature/add-remaining-screens/Example.js

         ```
         import 'react-native-gesture-handler';
         ```

      - There are few Node core modules like `buffer` which needs react native compatibility. Just require (or import) the below 
           module in your app before anything else. 

           https://www.npmjs.com/package/node-libs-react-native
           https://github.com/ChannelizeIO/Channelize-React-Native-Redux-Chat/blob/feature/add-remaining-screens/index.js

           ```
            import 'node-libs-react-native/globals';
           ``` 

          Add a metro.config.js file in the root directory of your React Native project and set `resolver.extraNodeModules`

          ```javascript
          let nodeLibs = require('node-libs-react-native');
          nodeLibs.fs = require.resolve('react-native-level-fs');
          nodeLibs.tls = require.resolve('node-libs-react-native/mock/tls');
          // metro.config.js
          module.exports = {
             resolver: {
               extraNodeModules: nodeLibs,
             },
          };
         ```
     - There is `crypto` package which is used needs implementation of `getRandomValues` for React Native. Just require (or 
        import) the below module in your app before anything else. 

         https://www.npmjs.com/package/react-native-get-random-values
         https://github.com/ChannelizeIO/Channelize-React-Native-Redux-Chat/blob/feature/add-remaining-screens/index.js

        ```
        import 'react-native-get-random-values'
        ```

5. **Add required config values `src/config.js` file.**

6. **Android & IOS Specific Setup**

    - **Android**

       Please see all the steps in detail in [React native doc](https://reactnative.dev/docs/environment-setup))

       1. Install Android Studio (https://developer.android.com/studio/index.html)
       1. Install Android SDK
       1. Configure the ANDROID_HOME environment variable
       1. There are few permissions which you need to provide in `AndroidManifest.xml`

       ```
      <uses-permission android:name="android.permission.INTERNET" />
      <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>
      <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
      <uses-permission android:name="android.permission.CAMERA" />
      <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
      <uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
      ```
       e. The `react-native-google-places` package require to set `RNGP_ANDROID_API_KEY` key with google api key.
       f. Connect Android device or Virtual device to Android Studio

       **Note for Android:**  There are few dependencies such as `react-native-google-places` don't have AndroidX support. But 
       an awesome tool named [jetifier](https://github.com/mikehardy/jetifier) is quite useful to patch these dependencies with 
       AndroidX support.

    -  **IOS**

7. **Run the react native application by following commands:**

   ```
   npm run start
   npm run android
   npm run ios
   ```

## Components
### App

This is the application component which combines all the components and takes Javascript SDK client object as prop and pass this object to all children components as props.

### ConversationList

This component is for displaying header and listing of all the conversations with a better UI. 

  **Props**
  `onSelect`: This is function type callback and triggers on any conversation select from the list.
  `onSearchIconClick`: This is function type callback and triggers on search icon click which is displayed on header.
   `onAddIconClick`: This is function type callback and triggers on add icon click which is displayed on header.
  
### ConversationWindow
This component is for displaying conversation header, message listing and message input box with a better UI. 

  **Props**
  `onBack`: This is function type callback and triggers on back icon click.
  `onConversationHeaderClick`: This is function type callback and triggers on.
  `onLocationClick`: This is function type callback and triggers on location icon click which is displayed on composer.

### ConversationDetails
This component is for listing members, updating conversation settings such as mute / unmute conversation, delete conversation, leave conversation, block / unblock user, Add / remove members etc.

  **Props**
  `onBack`: This is function type callback and triggers on back icon click.
  `onAddMembersClick`: This is function type callback and triggers on `Add Members`.

### CreateGroup
This component provides UI screen for creating a new group with group title, photo and by adding members.

  **Props**
  `onBack`: This is function type callback and triggers on back icon click.
  `onCreateSuccess`: This is function type callback and triggers on creating group successfully.

### AddMembers
This component provides a UI screen for adding new members in a group.

  **Props**
  `onBack`: This is function type callback and triggers on back icon click.
  
### Search
This component is for searching contacts & groups.

  **Props**
  `onBack`: This is function callback and triggers on back icon click.
  `onContactClick`: This is function callback and triggers on contact click.

### Location
This component is for listing google places and allow to search all google places over there. This component is useful in location sharing.

  **Props**
  `onBack`: This is function type callback and triggers on back icon click.
  `onPlacePress`: This is function type callback and triggers on any place press from the list.

### Avatar
This component renders the image and background color with initials.

### ChannelizeProvider
This is a context provider which stores the Javascript SDk `client` object in provider's `value` prop and pass client object to all children components.

### withChannelizeContext
This is a higher order function which takes component in input, merge the context data with the input component props and return the component. This function is used to access the context data in component.

## Themes
By default, the react native UI kit provides `light` and `dark` theme. The style object you have to pass to `App` component.

### Customize Theme
This react native UI kit allows you to update theme colors as well as you can update component wise colors. You can update theme colors loke this:

   ```
    const theme = {
      theme: 'light',
      colors: {
       primary: "blue"
      },
      conversationList: {
        backgroundColor: "grey"
      }
    }
    <App theme={theme} client={client} userId={LOGGEDIN_USER_ID} accessToken={CH_ACCESS_TOKEN}>
     // Other components
    />
   ```

## Integrate React Native UI Kit in your application

 To add the components, you need channelize public key and access token which can explore more [here](https://docs.channelize.io/platform-api-authentication-public/)

```
import { App, ConversationList, ConversationWindow, store } from './src';
// You can use your store file also

import { Channelize } from 'channelize-chat';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

class ConversationListScreen extends Component {
  static navigationOptions = () => {
    header: null
  };

  constructor(props) {
    super(props);
  }

  onConversationSelect = (conversation) => {
    this.props.navigation.navigate('ConversationWindow');
  }

  render() {
    var client = new Channelize.client({publicKey: PUBLIC_KEY});
    var theme = {
      theme: 'light'
    }

    return (
      <App theme={theme} client={client} userId={LOGGEDIN_USER_ID} accessToken={CH_ACCESS_TOKEN}>
        <ConversationList 
          onSelect={this.onConversationSelect}
        />
      </App>
    );
  }
}

class ConversationWindowScreen extends Component {
  static navigationOptions = ({ navigation }) => {
    header: null
  };

  constructor(props) {
    super(props);
  }

  onBack = () => {
    this.props.navigation.goBack();
  }

  render() {
    var client = new Channelize.client({publicKey: PUBLIC_KEY});
    var theme = {
      theme: 'light'
    }
    return (
      <App theme={theme} client={client} userId={LOGGEDIN_USER_ID} accessToken={CH_ACCESS_TOKEN}>
        <ConversationWindow 
          onBack={this.onBack}
        />
      </App>
    );
  }
}

const Stack = createStackNavigator();

export default class App extends React.Component {
  render() {
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="ConversationList" 
          screenOptions={{headerShown: false}}
          >
          <Stack.Screen name="ConversationList" component={ConversationListScreen} />
          <Stack.Screen name="ConversationWindow" component={ConversationWindowScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  }
}

```

## How to add UI Kit into your existing app
Please follow the below steps to add UI kit into your existing app:
1. Git clone the UI kit repository in a folder of your project's root directory.
2. If you are already using Redux, then import all reducers from UI kit to your application's root reducer file.
3. If you are not using Redux, then import `store` from UI kit in your application and pass `store` in `Redux Provider` before using `App`component of UI Kit as you can see in the above examples.
4. See UI kit's package.json file and add the missing packages in your project's package.json file.
5. Start using UI kit's components in your application component as you can see in the above examples.

## Issues:
The npm dependencies also include the below npm native packages which has native code /module. 

If you face any issue regarding these packages, please visit the respective package documentations:

- 1) react-native-vector-icons (https://www.npmjs.com/package/react-native-vector-icons)
- 2) react-native-image-picker (https://www.npmjs.com/package/react-native-image-picker)
- 3) react-native-google-places (https://www.npmjs.com/package/react-native-google-places)
- 4) @react-navigation (https://reactnavigation.org/docs/getting-started)
- 5) rn-fetch-blob (https://www.npmjs.com/package/rn-fetch-blob)
