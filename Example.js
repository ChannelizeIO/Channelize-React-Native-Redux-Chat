import 'react-native-gesture-handler';
import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { BackHandler } from "react-native";

import { 
  App,
  ConversationList,
  ConversationWindow,
  ConversationDetails,
  Search,
  AddMembers,
  CreateGroup,
  Location,
  store
} from './src';
import { Channelize } from 'channelize-chat';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const isDev = typeof __DEV__ === 'boolean' && __DEV__
process.env['NODE_ENV'] = isDev ? 'development' : 'production'

if (process.env.NODE_ENV === 'development') {
  GLOBAL.XMLHttpRequest = GLOBAL.originalXMLHttpRequest || GLOBAL.XMLHttpRequest;
  console.disableYellowBox = true;
}


let PUBLIC_KEY; //Channelize.io public key
let LOGGEDIN_USER_ID;//User id of loggedin user
let CH_ACCESS_TOKEN; //Channelize access token of loggedin userid

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

  onSearchIconClick = () => {
    this.props.navigation.navigate('Search');
  }

  onAddIconClick = () => {
    this.props.navigation.navigate('CreateGroup');
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
          onSearchIconClick={this.onSearchIconClick}
          onAddIconClick={this.onAddIconClick}
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

  onLocationClick = (callback) => {
    this.props.navigation.navigate('Location', {
      sendLocation: callback
    });
  }

  onConversationHeaderClick = (conversation) => {
    this.props.navigation.navigate('ConversationDetails');
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
          onConversationHeaderClick={this.onConversationHeaderClick}
          onLocationClick={this.onLocationClick}
        />
      </App>
    );
  }
}

class ConversationDetailsScreen extends Component {
  static navigationOptions = ({ navigation }) => {
    header: null
  };

  constructor(props) {
    super(props);
  }

  onAddMembersClick = () => {
    this.props.navigation.navigate('AddMembers');
  }

  onBack = (conversation) => {
    this.props.navigation.goBack();
  }

  onConversationDeleted = (conversation) => {
    this.props.navigation.navigate('ConversationList');
  }

  render() {
    var client = new Channelize.client({publicKey: PUBLIC_KEY});
    var theme = {
      theme: 'light'
    }
    return (
      <App theme={theme} client={client} userId={LOGGEDIN_USER_ID} accessToken={CH_ACCESS_TOKEN}>
        <ConversationDetails
          onBack={this.onBack}
          onAddMembersClick={this.onAddMembersClick}
          onConversationDeleted={this.onConversationDeleted}
        />
      </App>
    );
  }
}

class ContactListScreen extends Component {
  static navigationOptions = ({ navigation }) => {
    header: null
  };

  constructor(props) {
    super(props);
  }

  onBack = () => {
    this.props.navigation.goBack();
  }

  onContactClick = () => {
    this.props.navigation.navigate('ConversationWindow');
  }

  onGroupClick = () => {
    this.props.navigation.navigate('ConversationWindow');
  }

  render() {
    var client = new Channelize.client({publicKey: PUBLIC_KEY});
    var theme = {
      theme: 'light'
    }
    return (
      <App theme={theme} client={client} userId={LOGGEDIN_USER_ID} accessToken={CH_ACCESS_TOKEN}>
        <Search
          onBack={this.onBack}
          onContactClick={this.onContactClick} 
          onGroupClick={this.onGroupClick} 
        />
      </App>
    );
  }
}

class AddMembersScreen extends Component {
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
        <AddMembers
          onBack={this.onBack} 
        />
      </App>
    );
  }
}

class CreateGroupScreen extends Component {
  static navigationOptions = ({ navigation }) => {
    header: null
  };

  constructor(props) {
    super(props);
  }

  onBack = () => {
    this.props.navigation.goBack();
  }

  onCreateSuccess = () => {
    this.props.navigation.reset({
      index: 0,
      routes: [{ name: 'ConversationList' }, { name: 'ConversationWindow' }],
    });
  }

  render() {
    var client = new Channelize.client({publicKey: PUBLIC_KEY});
    var theme = {
      theme: 'light'
    }
    return (
      <App theme={theme} client={client} userId={LOGGEDIN_USER_ID} accessToken={CH_ACCESS_TOKEN}>
        <CreateGroup
          onBack={this.onBack}
          onCreateSuccess={this.onCreateSuccess} 
        />
      </App>
    );
  }
}

class LocationScreen extends Component {
  static navigationOptions = ({ navigation }) => {
    header: null
  };

  constructor(props) {
    super(props);
  }

  onBack = () => {
    this.props.navigation.goBack();
  }

  onPlacePress = (place, lookUpPlaceByIDCb) => {
    const { sendLocation } = this.props.route.params;

    this.props.navigation.navigate('ConversationWindow') 

    // Send location
    lookUpPlaceByIDCb(place, (result) => {
      sendLocation(result)
    })
  }

  render() {
    var client = new Channelize.client({publicKey: PUBLIC_KEY});
    var theme = {
      theme: 'light'
    }
    return (
      <App theme={theme} client={client} userId={LOGGEDIN_USER_ID} accessToken={CH_ACCESS_TOKEN}>
        <Location
          onBack={this.onBack}
          onPlacePress={this.onPlacePress}
          initialLocation="New delhi"
          options={{
            country: 'IN'
          }} 
        />
      </App>
    );
  }
}

const Stack = createStackNavigator();

export default function Example() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="ConversationList" 
          screenOptions={{headerShown: false}}
          >
          <Stack.Screen name="ConversationList" component={ConversationListScreen} />
          <Stack.Screen name="ConversationWindow" component={ConversationWindowScreen} />
          <Stack.Screen name="ConversationDetails" component={ConversationDetailsScreen} />
          <Stack.Screen name="Search" component={ContactListScreen} />
          <Stack.Screen name="AddMembers" component={AddMembersScreen} />
          <Stack.Screen name="CreateGroup" component={CreateGroupScreen} />
          <Stack.Screen name="Location" component={LocationScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  )
}