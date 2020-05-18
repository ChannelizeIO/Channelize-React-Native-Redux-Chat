import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ChannelizeProvider } from '../context';
import { chConnect, setConnected, registerEventHandlers } from '../actions';
import { connect } from 'react-redux';
import { Text, ActivityIndicator } from 'react-native';

class App extends Component {
  static propTypes = {
    /** The Channelize.io client object */
    client: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const { client, userId, accessToken } = this.props;

    if (!client.connected) {
      this.props.chConnect(client, userId, accessToken);
      return
    }

    this.props.setConnected(true)
  }

  componentDidUpdate(prevProps) {
    if (!this.props.connected) {
      return;
    }

    // Register real time events after successful connection
    if (!prevProps.connected && this.props.connected) {
      this.props.registerEventHandlers(this.props.client)
    }
  }

  getContext = () => ({
    client: this.props.client
  })

  render() {
    const { connected, error, connecting } = this.props;

    if (error) {
      return (
        <Text>Something went wrong</Text>
      )
    }

    return (
      <ChannelizeProvider value={this.getContext()}>
        { connecting && <ActivityIndicator size="large" color="#0084ff" /> }
        { this.props.children }
      </ChannelizeProvider>
    );
  }
};

function mapStateToProps({ client }) {
  return { ...client };
}

export default connect(
  mapStateToProps,
  { chConnect, setConnected, registerEventHandlers }
)(App);
