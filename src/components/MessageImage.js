import React, { PureComponent } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { withChannelizeContext } from '../context';
import { theme } from '../styles/theme';
import { Modal } from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'react-native-elements';

class MessageImage extends PureComponent {
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
    if (!attachment || ['image', 'gif', 'sticker'].indexOf(attachment.type) < 0) {
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
          source={{ uri: attachment.thumbnailUrl ?  attachment.thumbnailUrl : attachment.fileUrl}}
          PlaceholderContent={<ActivityIndicator />}
        />
        </TouchableOpacity>
        <Modal 
          visible={this.state.open}
          transparent={true}
          onRequestClose={() => {
            this.setState({open: false})
          }}
        >
          <SafeAreaView style={{flex:1, backgroundColor: 'transparent'}}>
            <ImageViewer 
              imageUrls={[
                {url:  attachment.fileUrl}
              ]}
              enableSwipeDown
              onCancel={() => {
                this.setState({open: false})
              }}
              saveToLocalByLongPress={false}
            />
          </SafeAreaView>
        </Modal>
      </View>
    )
  }
};

MessageImage = withChannelizeContext(
 theme(MessageImage)
);

export default MessageImage;