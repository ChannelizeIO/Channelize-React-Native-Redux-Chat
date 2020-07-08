import React, { PureComponent } from 'react';
import { Platform, View, Image, TouchableOpacity, Text, Linking, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { uuid } from 'uuidv4';

import {
  getMessageList,
  sendMessageToConversation,
  sendMessageToUserId,
  sendFileToConversation,
  loadMoreMessages as loadMoreMessagesAction,
  setActiveConversation
} from '../actions';
import { withChannelizeContext } from '../context';
import { theme } from '../styles/theme';
import styled from 'styled-components/native';
import { connect } from 'react-redux';
import { modifyMessageList, capitalize, dateTimeParser, typingString } from '../utils';
import { GiftedChat } from 'react-native-gifted-chat'
import Avatar from './Avatar'
import { pickImage } from '../native';
import throttle from 'lodash/throttle';
import debounce from 'lodash/debounce';

const Container = styled.View`
  position: absolute;
  top: 0px;
  height: 100%;
  width: 100%;
  background-color: ${props => props.theme.conversationWindow.backgroundColor };
  display: flex;
  flex-direction: column;
`;

const Header = styled.View`
  padding: 10px;
  flex-direction: row;
  background-color: ${props => props.theme.conversationWindow.backgroundColor };
`;

const HeaderBackIcon = styled.View`
  margin-right: 10px;
`;

const HeaderImage = styled.View`
  justify-content: center;
  margin-right: 10px;
`;

const HeaderTitle = styled.View`
  justify-content: center;
  overflow: hidden;
  flex-direction: column
`;

const HeaderTitleText = styled.Text`
  color: ${props => props.theme.conversationWindow.header.titleColor };
  text-transform: capitalize;
  font-weight: bold;
`;

const HeaderSubtitleText = styled.Text`
  color: ${props => props.theme.conversationWindow.header.subtitleColor };
`;

const ComposerActionsView = styled.View`
  display: flex;
  padding: 20px;
  flex-direction: row;
  justify-content: center;
`;

const TickView = styled.View`
  flex-direction: row;
  margin-right: 10px;
`;

const TickText = styled.Text`
  font-size: 10;
  color: ${props => props.theme.colors.textLight };
`;

const ReadTickText = styled.Text`
  font-size: 10;
  color: ${props => props.theme.colors.greenColor };
`;

const TypingView = styled.View`
  margin: 10px;
`;

const TypingText = styled.Text`
  color: ${props => props.theme.colors.textGrey };
`;

class ConversationWindow extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      dummyConversation: null,
      userId: null,
      showComposerActions: false,
    }

    this.limit = 30;
    this.skip = 0;
    this.sendMessage = this.sendMessage.bind(this);
    this.loadMoreMessage = this.loadMoreMessage.bind(this);
    this._markAsRead = throttle(this._markAsRead, 500);
    this._startTyping = throttle(this._startTyping, 3000);
    this._stopTyping = debounce(this._stopTyping, 3000);
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
      this._markAsRead(conversation);
    }
  }

  _markAsRead = (conversation) => {
    conversation.markAsRead();
  }

  _onTextMessageChanged = (textMessage) => {
    if (textMessage) {
      this._startTyping();
    }

    this._stopTyping();
  }

  _startTyping = () => {
    const { conversation } = this.props;
    if (conversation) {
      conversation.startTyping();
    }
  }

  _stopTyping = () => {
    const { conversation } = this.props;
    if (conversation) {
      conversation.stopTyping();
    }
  }

  _toggleComposerActions = () => {
    this.setState(state => ({
      showComposerActions: !state.showComposerActions
    }))
  }

  sendImage = () => {
    const { client, conversation, connected } = this.props;
    if (!connected) {
      return
    }

    pickImage((err, file) => {
      if (err || !file || file.didCancel) {
        return;
      }

      const body = {
        id: uuid(),
        pending: true,
        attachments: [{
          type: 'image',
          thumbnailUrl: file.uri
        }],
      }
      this.props.sendFileToConversation(client, conversation, file, body);
    })
  }

  sendMessage(messages) {
    const { conversation, client, connected } = this.props;

    if (!connected) {
      return
    }

    const newMessage = messages[0];
    let body = {
      id: uuid(),
      body: newMessage.text,
      pending: true,
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

  onConversationHeaderClick = () => {
    const { onConversationHeaderClick, conversation} = this.props;
    if (onConversationHeaderClick && typeof onConversationHeaderClick == 'function') {
      onConversationHeaderClick(conversation)
    }
  }

  back = () => {
    const { onBack } = this.props;
    this.props.setActiveConversation(null);
    if (onBack && typeof onBack == 'function') {
      onBack()
    }
  }

  render() {
    let {
      theme, 
      conversation,
      list,
      typing,
      loadingMoreMessage,
      allMessageLoaded,
      loading,
      error,
      client,
      connected,
      connecting
    } = this.props;
    const { dummyConversation, showComposerActions } = this.state;
    if (connecting) {
      return null;
    }

    // Set dummy conversation if conversation doesn't exist
    if (!conversation) {
      conversation = dummyConversation
      list = [];
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
    if (conversation) {
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
    }

    headerSubtitle = capitalize(headerSubtitle);

    const user = client.getCurrentUser();
    list = modifyMessageList(client, conversation, list);
    const typingStrings = typingString(typing);

    return (
      <Container>
          <Header style={{
              shadowColor: "#000",
              shadowOpacity: 0.18,
              shadowRadius: 1.00,
              elevation: 1
            }}>
            <HeaderBackIcon>
              <TouchableOpacity onPress={this.back}>
                <Icon 
                  name ="md-arrow-back" 
                  size={30} 
                  color={theme.colors.primary}
                />
              </TouchableOpacity>
            </HeaderBackIcon>
            <HeaderImage>
              <Avatar title={headerTitle} source={headerImage}/>
            </HeaderImage>
            <TouchableOpacity onPress={this.onConversationHeaderClick}>
              <HeaderTitle>
                <HeaderTitleText>{headerTitle}</HeaderTitleText>
                <HeaderSubtitleText>{headerSubtitle}</HeaderSubtitleText>
              </HeaderTitle>
            </TouchableOpacity>
          </Header>

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
            renderFooter={() => {
              if (!typingStrings) {
                return null;
              }

              return (
                <TypingView>
                  <TypingText>{typingStrings}</TypingText>
                </TypingView>
              )
            }}
            renderLoading={() => {
              if (!loading || !conversation) {
                return null;
              }

              return (
                <ActivityIndicator size="large" color={theme.colors.primary} />
              )
            }}
            loadEarlier={!loading && !allMessageLoaded}
            onLoadEarlier={this.loadMoreMessage}
            isLoadingEarlier={loadingMoreMessage}
            infiniteScroll={true}
            onSend={this.sendMessage}
            onInputTextChanged={this._onTextMessageChanged}
            renderTicks={(message) => {
              let text;
              if (message.showPendingStatus) {
                text = <TickText>🕓</TickText>
              } else if (message.showReceivedStatus) {
                text = <TickText>✓✓</TickText>
              } else if(message.showReadStatus) {
                text = <ReadTickText>✓✓</ReadTickText>
              }

              return (
                <TickView>
                  {text}
                </TickView>
              )
            }}
            renderActions={() => {
              return (
                <TouchableOpacity style={{marginLeft: 10, marginBottom: 10}}onPress={this.sendImage}>
                  <Icon 
                    name ="ios-image" 
                    size={20} 
                    color={theme.colors.primary}
                  />
                </TouchableOpacity>
              )
            }}
            renderChatEmpty={() => {
              if (loading || !conversation) {
                return null
              }

              return (
                <Text>No Record Found</Text>
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
          { showComposerActions &&
            <ComposerActionsView>
              <TouchableOpacity onPress={this.sendImage}>
                <Icon 
                  name ="ios-image" 
                  size={30} 
                  color={theme.colors.primary}
                />
              </TouchableOpacity>
              <TouchableOpacity style={{marginLeft: 10}} onPress={this.sendImage}>
                <Icon 
                  name ="ios-image" 
                  size={30} 
                  color={theme.colors.primary}
                />
              </TouchableOpacity>
              <TouchableOpacity style={{marginLeft: 10}} onPress={this.sendImage}>
                <Icon 
                  name ="ios-image" 
                  size={30} 
                  color={theme.colors.primary}
                />
              </TouchableOpacity>
            </ComposerActionsView>
          }
      </Container>
    )
  }
};

function mapStateToProps({ client, message }, ownProps) {
  let props = {...message, ...client};
  const mergedProps = { ...props, ...ownProps };
  return {...mergedProps}
}

ConversationWindow = withChannelizeContext(
 theme(ConversationWindow)
);

export default connect(
  mapStateToProps,
  {
    getMessageList,
    sendMessageToConversation,
    sendMessageToUserId,
    sendFileToConversation,
    loadMoreMessagesAction,
    setActiveConversation
}
)(ConversationWindow);