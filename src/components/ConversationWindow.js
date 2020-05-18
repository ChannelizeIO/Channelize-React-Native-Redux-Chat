import React, { PureComponent } from 'react';
import { View, Image, TouchableOpacity, Text, Linking, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import uuidv4 from 'uuid/v4';
import {
  getMessageList,
  sendMessageToConversation,
  sendMessageToUserId,
  loadMoreMessages as loadMoreMessagesAction,
  setActiveConversation
} from '../actions';
import { withChannelizeContext } from '../context';
import { connect } from 'react-redux';
import { modifyMessageList, capitalize, dateTimeParser } from '../utils';
import { GiftedChat } from 'react-native-gifted-chat'
import Avatar from './Avatar'

class ConversationWindow extends PureComponent {
    constructor(props) {
    super(props);

    this.state = {
      dummyConversation: null,
      userId: null
    }

    this.limit = 30;
    this.skip = 0;
    this.sendMessage = this.sendMessage.bind(this);
    this.loadMoreMessage = this.loadMoreMessage.bind(this);
  }

  componentDidMount() {
    const { connected } = this.props;
    if (!connected) {
      return
    }

    this._init();
  }

  componentDidUpdate(prevProps) {
    const { client, connected, conversation, newMessage, userId } = this.props;
    if (!connected) {
      return
    }

    // Find if need to refresh conversation
    const refresh = !prevProps.connected && this.props.connected;
    if (refresh) {
      this._init();
    }

    // if userId switches, re-intialize the conversation
    if (prevProps.userId != userId && userId) {
      this._init();
    }

    // Set the conversation after sending first mesage in dummy conversation
    if (!conversation && prevProps.sendingMessage && !this.props.sendingMessage) {
      let conversationListQuery = client.Conversation.createConversationListQuery();
      if (userId) {
        conversationListQuery.membersExactly = userId;
        conversationListQuery.isGroup = false;
      }

      conversationListQuery.list((err, conversations) => {
        if (conversations.length) {
          this.props.setActiveConversation(conversations[0])
          return
        }

        client.User.get(userId, (err, user) => {
          this.setState({
            dummyConversation: {isGroup: false, user}
          })
        })
      })
    }

    if (!conversation) {
      return
    }

    if ((!prevProps.conversation && conversation) || (prevProps.conversation.id != conversation.id)) {
      this._init();
    }

    // Mark as read new received message
    if((!prevProps.newMessage && newMessage) || (newMessage && prevProps.newMessage.id != newMessage.id) ) {
      const user = client.getCurrentUser();
      if (conversation && user.id != newMessage.ownerId) {
        conversation.markAsRead();
      }
    }
  }

  _init = () => {
    const { client, conversation, userId } = this.props;
    if (!conversation && !userId) {
      return
    }

    // Set active conversation, if conversation not exist, get the conversation from userId
    if (!conversation) {
      this.setState({
        dummyConversation: null
      })

      let conversationListQuery = client.Conversation.createConversationListQuery();
      if (userId) {
        conversationListQuery.membersExactly = userId;
        conversationListQuery.isGroup = false;
      }

      conversationListQuery.list((err, conversations) => {
        if (conversations.length) {
          this.props.setActiveConversation(conversations[0])
          return
        }

        client.User.get(userId, (err, user) => {
          this.setState({
            dummyConversation: {isGroup: false, user}
          })
        })
      })
    }

    if (!conversation) {
      return
    }

    // Load messages
    let messageListQuery = conversation.createMessageListQuery();
    messageListQuery.limit = this.limit;
    this.skip = 0;
    messageListQuery.skip = this.skip;
    this.props.getMessageList(messageListQuery);

    // Mark as read conversation
    if (conversation.unreadMessageCount > 0) {
      conversation.markAsRead();
    }
  }

  sendMessage(messages) {
    const { conversation, client, connected } = this.props;

    if (!connected) {
      return
    }

    const newMessage = messages[0];
    let body = {
      id: uuidv4(),
      body: newMessage.text
    }

    if (conversation.id) {
      this.props.sendMessageToConversation(conversation, body)
    } else {
      const userId = conversation.user.id;
      body.userId = userId;
      this.props.sendMessageToUserId(client, userId, body)
    }
  }

  loadMoreMessage() {
    const { conversation, connected, list, loadingMoreMessage, allMessageLoaded } = this.props;
    if (!connected) {
      return
    }

    if (loadingMoreMessage || allMessageLoaded || list.length < this.limit) {
      return
    }

    // Set skip
    this.skip = list.length;

    let messageListQuery = conversation.createMessageListQuery();
    messageListQuery.limit = this.limit;
    messageListQuery.skip = this.skip;
    this.props.loadMoreMessagesAction(messageListQuery)
  }

  back = () => {
    console.log("Back");
    this.props.setActiveConversation(null);
  }

  render() {
    let { 
      conversation,
      list,
      loadingMoreMessage,
      allMessageLoaded,
      loading,
      error,
      client,
      connected,
      connecting
    } = this.props;
    const { dummyConversation } = this.state;
    if (connecting) {
      return null;
    }

    // Set dummy conversation if conversation doesn't exist
    if (!conversation) {
      conversation = dummyConversation
      list = [];
    }

    if (!conversation) {
      return null;
    }

    if (error) {
      return (
        <View>
          <Text>Something Went Wrong</Text>
        </View>
      )
    }

    let headerImage;
    let headerTitle;
    let headerSubtitle;
    if (!conversation.isGroup) {
      if (conversation.user) {
        headerTitle = conversation.user.displayName;
        if (conversation.user.profileImageUrl) {
          headerImage = conversation.user.profileImageUrl;
        }
        headerSubtitle = conversation.user.isOnline ? 'Online' : 'Last Seen ' + dateTimeParser(conversation.user.lastSeen);
      } else {
        headerTitle = "Deleted User";
      }
    } else {
      headerTitle = conversation.title;
      if (conversation.profileImageUrl) {
        headerImage = conversation.profileImageUrl;
      }
      headerSubtitle = conversation.memberCount + ' Members';
    }

    headerSubtitle = capitalize(headerSubtitle);

    const user = client.getCurrentUser();
    list = modifyMessageList(client, conversation, list);
    return (
      <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.headerBack}>
              <TouchableOpacity onPress={this.back}>
                <Icon 
                  name ="md-arrow-back" 
                  size={30} 
                  color='#0084ff'
                />
              </TouchableOpacity>
            </View>
            <View  style={styles.headerImage}>
              <Avatar title={headerTitle} source={headerImage}/>
            </View>
            <View style={styles.headerTitle}>
              <Text style={styles.headerTitleText}>{headerTitle}</Text>
              <Text style={styles.headerSubtitleText}>{headerSubtitle}</Text>
            </View>
          </View>

          {!connecting && !connected && 
            <View>
              <Text>Disconnected</Text>
            </View>
          }

          <GiftedChat
            messages={list}
            user={{
              _id: user.id,
            }}
            renderLoading={() => {
              if (!loading) {
                return null;
              }

              return (
                <ActivityIndicator size="large" color="#0084ff" />
              )
            }}
            loadEarlier={!loading && !allMessageLoaded}
            onLoadEarlier={this.loadMoreMessage}
            isLoadingEarlier={loadingMoreMessage}
            infiniteScroll={true}
            onSend={this.sendMessage}
            renderChatEmpty={() => {
              if (loading) {
                return null
              }

              return (
                <Text>No Record Found</Text>
              )
            }}
            isCustomViewBottom={true}
            renderCustomView={(message) => {
              const showReadStatus = message.currentMessage.showReadStatus;
              const readByAll = message.currentMessage.readByAll;

              if (!showReadStatus) {
                return null;
              }

              return (
                <View style={styles.readByAllIcon}>
                  <Icon
                    name='md-done-all'
                    type='ionicons'
                    size={10}
                    color={readByAll ? 'darkgreen' : '#FFF'}
                  />
                </View>
              )
            }}
            renderMessageVideo={(message) => {
              return (
                <View>
                  <Text> Shared a Video: </Text>
                  <Text 
                    style={{textDecorationLine: 'underline'}}
                    onPress={() => {
                      const url = message.currentMessage.video;
                      Linking.canOpenURL(url).then(supported => {
                          if (!supported) {
                              console.error('No handler for URL:', url);
                          }
                          else {
                              Linking.openURL(url);
                          }
                        })
                      }}> {message.currentMessage.video} </Text>
                </View>
              )
            }}
          />
      </View>
    )
  }
};

const styles = {
  container: {
    position: 'absolute',
    top: 0,
    height: '100%',
    width: '100%',
    backgroundColor: '#FFFFFF',
    flex:1,
    flexDirection: 'column'
  },
  header: {
    padding: 10,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 1.00,
    elevation: 1,
  },
  headerBack: {
    marginRight: 10
  },
  headerImage: {
    justifyContent: 'center',
    marginRight: 10,
  },
  headerTitle: {
    width: '40%',
    overflow: 'hidden',
    flexDirection: 'column',
  },
  headerTitleText: {
    color: "#000",
    textTransform: 'capitalize',
    fontWeight: 'bold'
  },
  headerSubtitleText: {
    color: "#b2b2b2"
  },
  readByAllIcon: {
    position: 'absolute',
    bottom: 0,
    right: 5,
  }
};

function mapStateToProps({ client, message }, ownProps) {
  let props = {...message, ...client};
  const mergedProps = { ...props, ...ownProps };
  return {...mergedProps}
}

ConversationWindow = withChannelizeContext(ConversationWindow);

export default connect(
  mapStateToProps,
  {
    getMessageList,
    sendMessageToConversation,
    sendMessageToUserId,
    loadMoreMessagesAction,
    setActiveConversation
}
)(ConversationWindow);