import React, { PureComponent } from 'react';
import { View, Text, TouchableOpacity, Modal, SafeAreaView, ActivityIndicator } from 'react-native';
import { withChannelizeContext } from '../context';
import { theme } from '../styles/theme';
import VideoPlayer from 'react-native-video-controls';
import { Image, Icon } from 'react-native-elements';

class MessageVideo extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      open: false
    }
  }

  render() {
    let {
      theme,
      error,
      message,
      client
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
 
    if (!attachment || attachment.type != 'video') {
      return null;
    }

    return (
      <View>
        <TouchableOpacity
          onPress={() => {
            this.setState({open: true})
          }}
        >
        <Image 
          style={{
            width: 150,
            height: 100,
            borderRadius: 13,
            margin: 3,
            resizeMode: 'cover',
          }}
          source={{ uri: attachment.thumbnailUrl }}
          PlaceholderContent={<ActivityIndicator />}
        >
          <View style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Icon 
              name="play-circle-filled" 
              size={30}
              color='white'
            />
          </View>
        </Image>
      </TouchableOpacity>
      <Modal 
       visible={this.state.open}
       transparent={true}
       onRequestClose={() => {
         this.setState({open: false})
       }}
       >
        <SafeAreaView 
          style={{
            flex:1,
            backgroundColor: 'transparent',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
          <VideoPlayer 
            source={{uri: attachment.fileUrl}}
            disableFullscreen={true}
            disableBack={true}
            disableVolume={true}
          />
        </SafeAreaView>
      </Modal>
      </View>
    )
  }
};

MessageVideo = withChannelizeContext(
 theme(MessageVideo)
);

export default MessageVideo;