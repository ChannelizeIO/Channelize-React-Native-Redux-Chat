import React, { PureComponent } from 'react';
import { View, Image, TouchableHighlight, FlatList, ActivityIndicator } from 'react-native';
import { withChannelizeContext } from '../context';
import { connect } from 'react-redux';
import { capitalize, dateTimeParser, getLastMessageString } from '../utils';
import {
  getConversationList,
  loadMoreConversations,
  setActiveConversation
} from "../actions";
import { ListItem, Text, Badge } from 'react-native-elements'
import Avatar from './Avatar'

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
    const conversation = rowData.item;
    return (
      <ListItem
        component={TouchableHighlight}
        containerStyle={{ backgroundColor: '#fff' }}
        key={conversation.id}
        leftAvatar={this._getAvatar(conversation)}
        title={this._renderTitle(conversation)}
        titleStyle={{ fontWeight: '500', fontSize: 16 }}
        subtitle={this._renderLastMessage(conversation)}
        rightTitle={this._renderBadge(conversation)}
        rightSubtitle={this._renderRightSubtitle(conversation)}
        subtitleStyle={{ fontWeight: '300', fontSize: 11 }}
        onPress={() => this._onPress(conversation)}
        bottomDivider
      />
    );
  };

  _onPress = conversation => {
    console.log('onPress', conversation)
    this.props.setActiveConversation(conversation);
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
        <Text numberOfLines={1} style={styles.titleText}>{title}</Text>
      </View>
    );
  };

  _renderBadge = conversation => {
    let { unreadMessageCount } = conversation;

    if (unreadMessageCount) {
      unreadMessageCount = unreadMessageCount > 99 ? '99+' : unreadMessageCount;
      return <Badge status="primary"  value={unreadMessageCount}/>
    }

    return
  };

  _renderRightSubtitle = conversation => {
    const { lastMessage } = conversation;
    return lastMessage ? dateTimeParser(conversation.updatedAt) : null;
  };

  _getAvatar = conversation => {
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
          title={avatarTitle}
          source={avatarUrl}
          accessory={{
            name: 'dot-single',
            type: 'entypo',
            color: '#64ba00',
            containerStyle: {
              backgroundColor: '#64ba00',
              borderRadius: 25
            },
          }}
          showAccessory={true}
        />
      )
    }

    return (
      <Avatar 
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
        <Text numberOfLines={1} style={styles.lastMessageText}>{lastMessageString}</Text>
      </View>
    );
  };

  render() {
    let { userId, conversation, client, connected, connecting, list, loading, error, loadingMoreConversations } = this.props;
    if (connecting) {
      return null;
    }

    const user = client.getCurrentUser();
    if (!user) {
      return null;
    }

    // if any active userId or conversation exist, then return true 
    if (userId || conversation) {
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
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerImage}>
            <Avatar 
              title={user.displayName}
              source={headerImage}
              accessory={{
                name: 'dot-single',
                type: 'entypo',
                color: '#64ba00',
                containerStyle: {
                  backgroundColor: '#64ba00',
                  borderRadius: 25
                },
              }}
              showAccessory={true}
            />
          </View>
          <View style={styles.headerTitle}>
            <Text style={styles.headerTitleText} h3>{headetTitle}</Text>
          </View>
        </View>

        {!connecting && !connected && 
          <View>
            <Text>Disconnected</Text>
          </View>
        }

        { loading &&
            <View>
              <ActivityIndicator size="large" color="#0084ff" />
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

        { loadingMoreConversations && <ActivityIndicator size="large" color="#0084ff" /> }
      </View>
    )
  }
};

ConversationList = withChannelizeContext(ConversationList);

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
  headerImage: {
    justifyContent: 'center',
    marginRight: 10
  },
  headerTitle: {
    justifyContent: 'center',
  },
  headerTitleText: {
    color: "#000",
    textTransform: 'capitalize',
  },
  lastMessageText: {
    color: "#b2b2b2",
  },
  titleText: {
    color: "#000",
    fontWeight: 'bold'
  },
};

function mapStateToProps({ client, message, conversation }) {
  return {...conversation, ...client, userId: message.userId, conversation: message.conversation}
}

export default connect(
  mapStateToProps,
 { getConversationList, loadMoreConversations, setActiveConversation },
)(ConversationList);