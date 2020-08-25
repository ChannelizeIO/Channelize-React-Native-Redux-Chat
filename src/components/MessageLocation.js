import React, { PureComponent } from 'react';
import { View, Text, TouchableOpacity, Platform, Linking, ActivityIndicator } from 'react-native';
import { withChannelizeContext } from '../context';
import { theme } from '../styles/theme';
import { Image } from 'react-native-elements';

class MessageLocation extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      redirectToGoogleMap: true
    }
  }

  redirectToGoogleMap = (attachment) => {
    if (!this.state.redirectToGoogleMap) {
      return
    }

    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const { latitude, longitude } = attachment;
    const latLng = `${latitude},${longitude}`;
    const label = 'Custom Label';
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`
    });
    Linking.openURL(url); 
  }

  render() {
    let {
      theme,
      error,
      message
    } = this.props;
    const { open } = this.state;

    if (error) {
      return (
        <View>
          <Text>Something Went Wrong</Text>
        </View>
      )
    }

    if (!message) {
      return null;
    }
  
    const attachment = message.attachments[0];
    if (!attachment || attachment.type != 'location') {
      return null;
    }

    return (
      <View>
        <TouchableOpacity
          onPress={() => {this.redirectToGoogleMap(attachment)}}
        >
        <Image 
          style={{
            width: 150,
            height: 100,
            borderRadius: 13,
            margin: 3,
            resizeMode: 'cover',
          }}
          source={{ uri: message.image }}
          PlaceholderContent={<ActivityIndicator />}
        />
        </TouchableOpacity>
      </View>
    )
  }
};

MessageLocation = withChannelizeContext(
 theme(MessageLocation)
);

export default MessageLocation;