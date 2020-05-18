## Setup
1. Install React Native CLI
  ```
npm install -g react-native-cli
  ```
2. Install npm dependencies
```
npm run install
```
3. **For Android**: (Please see all the steps in detail in [React native doc](https://reactnative.dev/docs/environment-setup)) 
   a) Install Android Studio (https://developer.android.com/studio/index.html)
   b) Install Android SDK
   c) Configure the ANDROID_HOME environment variable
   d) Connect Android device or Virtual device to Android Studio

4. Run the react native application by following commands:

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
import ConversationList from './src/components/ConversationList';
import ConversationWindow from './src/components/ConversationWindow';
import { Channelize } from 'channelize-chat';

import { Provider } from 'react-redux';
import { store } from './src/store';
// You can use your store file also

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
import ConversationWindow from './src/components/ConversationList';
import { Channelize } from 'channelize-chat';

import { Provider } from 'react-redux';
import { store } from './src/store';
// You can use your store file also

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
import ConversationWindow from './src/components/ConversationList';
import { Channelize } from 'channelize-chat';

import { Provider } from 'react-redux';
import { store } from './src/store';
// You can use your store file also

export default (props) => {
	const [conversation, setConversation] = useState('');

	const client = new Channelize.client({publicKey: PUBLIC_KEY});

	useEffect(() => {
	    getConversation();
	}, [conversation]);

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