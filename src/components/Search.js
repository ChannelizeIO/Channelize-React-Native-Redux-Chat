import React, { PureComponent } from 'react';
import { Platform, ScrollView, View, Image, TouchableHighlight, TouchableOpacity, Text, FlatList, ActivityIndicator } from 'react-native';
import { Icon } from 'react-native-elements';
import {
  loadOnlineFriends,
  getFriendsList,
  searchFriendList,
  searchGroups,
  setActiveUserId,
  setActiveConversation
} from '../actions';
import { withChannelizeContext } from '../context';
import { theme } from '../styles/theme';
import styled from 'styled-components/native';
import { connect } from 'react-redux';
import { capitalize } from '../utils';
import { ListItem, Button, Input, SearchBar } from 'react-native-elements';
import Avatar from './Avatar'
import debounce from 'lodash/debounce';

const Container = styled.ScrollView`
  position: absolute;
  top: 0px;
  height: 100%;
  width: 100%;
  background-color: ${props => props.theme.search.backgroundColor };
  display: flex;
  flex-direction: column;
`;

const Header = styled.View`
  padding-left: 10px;
  flex-direction: column;
  background-color: ${props => props.theme.search.backgroundColor };
`;

const HeaderContent = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

const HeaderErrorMessage = styled.View`
  padding-bottom: 10px;
  padding-top: 10px;
  flex-direction: row;
  justify-content: center; 
`;

const HeaderErrorMessageText = styled.Text`
  color: ${props => props.theme.colors.danger };
`;

const ContentContainer = styled.View`
`;

const SeachListContainer = styled.View`
  width: 100%;
  background-color: ${props => props.theme.search.backgroundColor };
`;

const Center = styled.View`
  justify-content: center;
  align-self: center;
`;

const HeaderBackIcon = styled.View`
  margin-right: 10px;
`;

const SearchedListName = styled.Text`
  color: ${props => props.theme.colors.textGrey };
  text-transform: capitalize;
  padding-left: 15px;
  padding-bottom: 15px;
  padding-top: 15px;
`;

const SearchedItemName = styled.Text`
  color: ${props => props.theme.search.searchList.searchedItemNameColor };
  font-weight: bold;
`;

class Search extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      search: ''
    }

    this._searchOnServer = debounce(this._searchOnServer, 800)
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

    if (!prevProps.connected && connected) {
      this._init();
    }
  }

  _init = () => {
    const { client } = this.props;

    // Load friends list
    let friendListQuery = client.User.createUserListQuery();
    friendListQuery.limit = 50;
    friendListQuery.skip = 0;
    friendListQuery.sort = 'isOnline DESC, displayName ASC ';
    this.props.getFriendsList(friendListQuery);
  }

  _renderContact = rowData => {
    const { theme } = this.props;
    const member = rowData.item;
    return (
      <ListItem
        component={TouchableHighlight}
        containerStyle={{ backgroundColor: theme.search.backgroundColor }}
        key={member.id}
        leftAvatar={this._getContactAvatar(member)}
        title={this._renderDisplayName(member)}
        titleStyle={{ fontWeight: '500', fontSize: 16 }}
        onPress={() => this._onContactPress(member)}
      />
    );
  };

  _renderGroup = rowData => {
    const { theme } = this.props;
    const group = rowData.item;
    return (
      <ListItem
        component={TouchableHighlight}
        containerStyle={{ backgroundColor: theme.search.backgroundColor }}
        key={group.id}
        leftAvatar={this._getGroupAvatar(group)}
        title={this._renderGroupName(group)}
        titleStyle={{ fontWeight: '500', fontSize: 16 }}
        onPress={() => this._onGroupPress(group)}
      />
    );
  };

  _getContactAvatar = user => {
    const { theme } = this.props;

    let avatarUrl;
    let avatarTitle;
    let showOnlineAccessory = false;

    if (user) {
      avatarTitle = user.displayName;
      if (user.profileImageUrl) {
        avatarUrl = user.profileImageUrl;
      }
      showOnlineAccessory = user.isOnline;
    } else {
      avatarTitle = "Deleted User"
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
  }

  _getGroupAvatar = group => {
    const { theme } = this.props;

    let avatarUrl;
    let avatarTitle;

    avatarTitle = group.title;
    if (!avatarTitle) {
      avatarTitle = "Untitled group";
    }
    if (group.profileImageUrl) {
      avatarUrl = group.profileImageUrl;
    }

    return (
      <Avatar 
        size="medium"
        title={avatarTitle}
        source={avatarUrl}
      />)
  }

  _renderGroupName = group => {
    console.log("gorup>>>>>>>>>>>>", group.title)
    let title = capitalize(group.title);
    if (!title) {
      title = "Untitled group";
    }

    return (
      <View>
        <SearchedItemName numberOfLines={1}>{title}</SearchedItemName>
      </View>
    );
  }


  _renderDisplayName = user => {
    let title;
    if (user) {
      title = capitalize(user.displayName);
    } else {
      title = "Deleted Member";
    }

    return (
      <View>
        <SearchedItemName numberOfLines={1}>{title}</SearchedItemName>
      </View>
    );
  }

  back = () => {
    const { onBack } = this.props;
    if (onBack && typeof onBack == 'function') {
      onBack()
    }
  }

  _resetSearch = () => {
    this.setState({search: ''});
  }

  _onChangeSearch = (value) => {
    this.setState({search: value})
    if (!value) {
      return
    }

    this._searchOnServer(value);
  }

  _searchOnServer = (value) => {
    const { client } = this.props;

    // Load friends list
    let friendListQuery = client.User.createUserListQuery();
    friendListQuery.search = value;
    friendListQuery.limit = 50;
    friendListQuery.skip = 0;
    friendListQuery.includeBlocked = true;
    friendListQuery.sort = 'isOnline DESC, displayName ASC ';
    this.props.searchFriendList(friendListQuery);

    // Load groups
    let conversationListQuery = client.Conversation.createConversationListQuery();
    conversationListQuery.search = value;
    conversationListQuery.isGroup = true;
    conversationListQuery.limit = 50;
    conversationListQuery.skip = 0;
    this.props.searchGroups(conversationListQuery);
  }

  _onContactPress = user => {
    const { onContactClick } = this.props;

    this.props.setActiveUserId(user.id);
    if (onContactClick && typeof onContactClick == 'function') {
      onContactClick(user.id)
    }
  }

  _onGroupPress = group => {
    const { onGroupClick } = this.props;

    this.props.setActiveConversation(group);
    if (onGroupClick && typeof onGroupClick == 'function') {
      onGroupClick(group)
    }
  }
  
  render() {
    let {
      theme, 
      friendList,
      loading,
      searching,
      searchedFriendList,
      searchingGroups,
      searchedGroups,
      error,
      client,
      connected,
      connecting,

    } = this.props;
    const { search } = this.state;

    if (connecting) {
      return null;
    }

    if (error) {
      return (
        <View>
          <Text>Something Went Wrong</Text>
        </View>
      )
    }

    if (search) {
      friendList = searchedFriendList;
    } else {
      searchedGroups = [];
    }

    const user = client.getCurrentUser();
    return (
      <Container>
        <Header style={{
            shadowColor: "#000",
            shadowOpacity: 0.18,
            shadowRadius: 1.00,
            elevation: 1
          }}>
          <HeaderContent>
            <HeaderBackIcon>
              <TouchableOpacity onPress={this.back}>
                <Icon 
                  name ="arrow-back" 
                  size={30} 
                  color={theme.colors.primary}
                />
              </TouchableOpacity>
            </HeaderBackIcon>
            <SearchBar
              containerStyle={{
                paddingBottom: 1,
                paddingTop: 1,
                width: "90%",
                backgroundColor: theme.search.searchBar.backgroundColor,
              }}
              inputStyle={{
                color: theme.search.searchBar.inputTextColor
              }}
              placeholder="Search"
              placeholderTextColor={theme.colors.textGrey}
              searchIcon={false}
              cancelIcon={false}
              platform={Platform.OS}
              onClear={this._resetSearch}
              onChangeText={this._onChangeSearch}
              value={search}
            />
          </HeaderContent>
          {!connecting && !connected && 
            <HeaderErrorMessage>
              <HeaderErrorMessageText>Disconnected</HeaderErrorMessageText>
            </HeaderErrorMessage>
          }
        </Header>

        <ContentContainer>
        { (loading || searching || searchingGroups) && 
          <View>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        }

        { !loading && !searching && !searchingGroups && !friendList.length && !searchedGroups.length &&
          <Center><Text>No record Found</Text></Center>
        }

        <React.Fragment>
          {  !loading && !searching && !!friendList.length && <SearchedListName>Contacts</SearchedListName> }
          <SeachListContainer>
            { (!loading && !searching) &&
              <FlatList
                renderItem={this._renderContact}
                data={friendList}
                extraData={true}
                keyExtractor={(item, index) => item.id}
              />
            }
          </SeachListContainer>
        </React.Fragment>

        <React.Fragment>
          { !!searchedGroups.length && <SearchedListName>Groups</SearchedListName> }
          <SeachListContainer>
            { !searchingGroups &&
              <FlatList
                renderItem={this._renderGroup}
                data={searchedGroups}
                extraData={true}
                keyExtractor={(item, index) => item.id}
              />
            }
          </SeachListContainer>
        </React.Fragment>
      </ContentContainer>
      </Container>
    )
  }
};

function mapStateToProps({ client, user, conversation }, ownProps) {
  let props = {...user, ...client, searchingGroups: conversation.searching, searchedGroups: conversation.searchedGroups};
  const mergedProps = { ...props, ...ownProps };
  return {...mergedProps}
}

Search = withChannelizeContext(
 theme(Search)
);

export default connect(
  mapStateToProps,
  {
    loadOnlineFriends,
    getFriendsList,
    searchFriendList,
    setActiveUserId,
    searchGroups,
    setActiveConversation
  }
)(Search);