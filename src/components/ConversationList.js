import React, { PureComponent } from 'react';
import { View, Image, TouchableHighlight, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { withChannelizeContext } from '../context';
import { theme } from '../styles/theme';
import styled from 'styled-components/native';
import { connect } from 'react-redux';
import { capitalize, dateTimeParser, getLastMessageString } from '../utils';
import {
  getConversationList,
  loadMoreConversations,
  setActiveConversation
} from "../actions";
import { ListItem, Text, Badge } from 'react-native-elements'
import Avatar from './Avatar'
import { Icon } from 'react-native-elements';

const Container = styled.View`
  position: absolute;
  top: 0px;
  height: 100%;
  width: 100%;
  background-color: ${props => props.theme.conversationList.backgroundColor };
  display: flex;
  flex-direction: column;
`;

const Header = styled.View`
  padding: 10px;
  flex-direction: column;
  background-color: ${props => props.theme.conversationList.backgroundColor };
`;

const HeaderContent = styled.View`
  flex-direction: row;
`;

const HeaderErrorMessage = styled.View`
  margin-top: 10px;
  flex-direction: row;
  justify-content: center; 
`;

const HeaderErrorMessageText = styled.Text`
  color: ${props => props.theme.colors.danger };
`;

const HeaderImage = styled.View`
  justify-content: center;
  margin-right: 10px;
`;

const HeaderTitle = styled.View`
  justify-content: center;
  flex-grow: 8;
`;

const HeaderTitleText = styled.Text`
  color: ${props => props.theme.conversationList.header.titleColor };
  text-transform: capitalize;
  font-weight: bold;
  font-size: 20px;
`;

const HeaderIcons = styled.View`
  flex-direction: row;
`;

const LastMessageText = styled.Text`
  color: ${props => props.theme.conversationList.message.textColor };
`;

const DateText = styled.Text`
  color: ${props => props.theme.conversationList.date.color };
`;

const TitleText = styled.Text`
  color: ${props => props.theme.conversationList.title.color };
  font-weight: bold;
`;

class ConversationList extends PureComponent {
  constructor(props) {
    super(props);

    this.limit = 30;
    this.skip = 0;
  }

  componentDidMount() {
    const { connected } = this.props;

    if (!connected) {
      return
    }

    this._init();
  }

  componentDidUpdate(prevProps) {
    const { client, connected } = this.props;
    if (!connected) {
      return
    }

    // Find if need to refresh conversation
    const refresh = !prevProps.connected && this.props.connected;
    if (refresh) {
      this._init();
    }
  }

  _init = () => {
    const { client } = this.props;

    // Load conversations
    let conversationListQuery = client.Conversation.createConversationListQuery();
    conversationListQuery.limit = this.limit;
    conversationListQuery.skip = this.skip;
    this.props.getConversationList(conversationListQuery);
  }

  loadMoreConversations = () => {
    const { list, connected, client, loadingMoreConversations, allConversationsLoaded } = this.props;

    if (!connected) {
      return
    }

    if (loadingMoreConversations || allConversationsLoaded || list.length < this.limit) {
      return
    }

    // Set skip
    this.skip = list.length;

    let conversationListQuery = client.Conversation.createConversationListQuery();
    conversationListQuery.limit = this.limit;
    conversationListQuery.skip = this.skip;
    this.props.loadMoreConversations(conversationListQuery)
  }

  _renderItem = rowData => {
    const { theme } = this.props;
    const conversation = rowData.item;
    return (
      <ListItem
        component={TouchableHighlight}
        containerStyle={{ backgroundColor: theme.conversationList.backgroundColor }}
        key={conversation.id}
        leftAvatar={this._getAvatar(conversation)}
        title={this._renderTitle(conversation)}
        titleStyle={{ fontWeight: '500', fontSize: 16 }}
        subtitle={this._renderLastMessage(conversation)}
        rightTitle={this._renderBadge(conversation)}
        rightSubtitle={this._renderRightSubtitle(conversation)}
        subtitleStyle={{ fontWeight: '300', fontSize: 11 }}
        onPress={() => this._onPress(conversation)}
      />
    );
  };

  _onPress = conversation => {
    const { onSelect } = this.props;
    this.props.setActiveConversation(conversation);
    if (onSelect && typeof onSelect == 'function') {
      onSelect(conversation);
    }
  }

  _onSearchIconClick = () => {
    const { onSearchIconClick } = this.props;
    if (onSearchIconClick && typeof onSearchIconClick == 'function') {
      onSearchIconClick()
    }
  }

  _onAddIconClick = () => {
    const { onAddIconClick } = this.props;
    if (onAddIconClick && typeof onAddIconClick == 'function') {
      onAddIconClick()
    }
  }

  _renderTitle = conversation => {
    let title;
    if (conversation.isGroup) {
      title = conversation.title;
    } else {
      if (conversation.user) {
        title = capitalize(conversation.user.displayName);
      } else {
        title = "Deleted Member";
      }
    }

    return (
      <View>
        <TitleText numberOfLines={1}>{title}</TitleText>
      </View>
    );
  };

  _renderBadge = conversation => {
    let { theme } = this.props;
    let { unreadMessageCount } = conversation;

    if (unreadMessageCount) {
      unreadMessageCount = unreadMessageCount > 99 ? '99+' : unreadMessageCount;
      return <Badge badgeStyle={{backgroundColor: theme.colors.primary}}  value={unreadMessageCount}/>
    }

    return
  };

  _renderRightSubtitle = conversation => {
    const { lastMessage } = conversation;
    const date = lastMessage ? dateTimeParser(conversation.updatedAt) : null;
    return (
      <View>
        <DateText>{date}</DateText>
      </View>
    );
  };

  _getAvatar = conversation => {
    const { theme } = this.props;

    let avatarUrl;
    let avatarTitle;

    let showOnlineAccessory = false;

    if (conversation.isGroup) {
      avatarTitle = conversation.title;
      if (conversation.profileImageUrl) {
        avatarUrl = conversation.profileImageUrl;
      }
    } else {
      if (conversation.user) {
        avatarTitle = conversation.user.displayName;
        if (conversation.user.profileImageUrl) {
          avatarUrl = conversation.user.profileImageUrl;
        }
        showOnlineAccessory = conversation.user.isOnline;
      } else {
        avatarTitle = "Deleted User"
      }
    }

    if (showOnlineAccessory) {
      return (
        <Avatar 
          size="medium"
          title={avatarTitle}
          source={avatarUrl}
          accessory={{
            name: 'dot-single',
            type: 'entypo',
            color: theme.colors.greenColor,
            containerStyle: {
              backgroundColor: theme.colors.greenColor,
              borderRadius: 25
            },
          }}
          showAccessory={true}
        />
      )
    }

    return (
      <Avatar 
        size="medium"
        title={avatarTitle}
        source={avatarUrl}
      />)
  };

  _renderLastMessage = conversation => {
    const { lastMessage } = conversation;
    const { client } = this.props;
    const lastMessageString = getLastMessageString(client, conversation);

    return (
      <View>
        <LastMessageText numberOfLines={1}>{lastMessageString}</LastMessageText>
      </View>
    );
  };

  render() {
    let { theme, client, connected, connecting, list, loading, error, loadingMoreConversations } = this.props;

    if (connecting) {
      return null;
    }

    const user = client.getCurrentUser();
    if (!user) {
      return null;
    }

    if (error) {
      return (
        <View>
          <Text>Something Went Wrong</Text>
        </View>
      )
    }

    let headerImage = user.profileImageUrl;
    let headetTitle = "Chats";

    return (
      <React.Fragment>
        <Container>
          <Header style={{
            shadowColor: "#000",
            shadowOpacity: 0.18,
            shadowRadius: 1.00,
            elevation: 1
          }}>
          <HeaderContent>
            <HeaderImage>
              <Avatar 
                title={user.displayName}
                source={headerImage}
                accessory={{
                  name: 'dot-single',
                  type: 'entypo',
                  color: theme.colors.greenColor,
                  containerStyle: {
                    backgroundColor: theme.colors.greenColor,
                    borderRadius: 25
                  },
                }}
                showAccessory={true}
              />
            </HeaderImage>
            <HeaderTitle>
              <HeaderTitleText h3>{headetTitle}</HeaderTitleText>
            </HeaderTitle>
            <HeaderIcons>
              <TouchableOpacity onPress={this._onAddIconClick}>
                <Icon 
                  name ="add"
                  size={30} 
                  color={theme.colors.primary}
                />
              </TouchableOpacity>
              <TouchableOpacity style={{marginLeft: 15}} onPress={this._onSearchIconClick}>
                <Icon 
                  name ="search" 
                  size={30} 
                  color={theme.colors.primary}
                />
              </TouchableOpacity>
            </HeaderIcons>
          </HeaderContent>
          {!connecting && !connected && 
             <HeaderErrorMessage>
              <HeaderErrorMessageText>Disconnected</HeaderErrorMessageText>
            </HeaderErrorMessage>
          }
          </Header>

          { loading &&
              <View>
                <ActivityIndicator size="large" color={theme.colors.primary} />
              </View>
          }

          { !loading &&
            <FlatList
              renderItem={this._renderItem}
              data={list}
              extraData={true}
              keyExtractor={(item, index) => item.id}
              onEndReached={this.loadMoreConversations}
              ListEmptyComponent={<Text>No Conversation Found</Text>}
            />
          }

          { loadingMoreConversations && <ActivityIndicator size="large" color={theme.colors.primary} /> }
        </Container>
      </React.Fragment>
    )
  }
};

ConversationList = withChannelizeContext(
 theme(ConversationList)
);

function mapStateToProps({ client, conversation }) {
  return {...conversation, ...client}
}

export default connect(
  mapStateToProps,
 { getConversationList, loadMoreConversations, setActiveConversation },
)(ConversationList);