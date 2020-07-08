import React, { PureComponent } from 'react';
import { Platform, ScrollView, View, Image, TouchableHighlight, TouchableOpacity, Text, FlatList, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  loadOnlineFriends,
  getFriendsList,
  searchFriendList,
  addMembers
} from '../actions';
import { withChannelizeContext } from '../context';
import { theme } from '../styles/theme';
import styled from 'styled-components/native';
import { connect } from 'react-redux';
import { capitalize } from '../utils';
import { ListItem, Button, Input, CheckBox, SearchBar } from 'react-native-elements';
import Avatar from './Avatar'
import debounce from 'lodash/debounce';

const Container = styled.ScrollView`
  position: absolute;
  top: 0px;
  height: 100%;
  width: 100%;
  background-color: ${props => props.theme.addMembers.backgroundColor };
  display: flex;
  flex-direction: column;
`;

const Header = styled.View`
  flex-direction: row;
  background-color: ${props => props.theme.addMembers.backgroundColor };
  align-items: center;
  justify-content: center;
`;

const ContactsContainer = styled.View`
  width: 100%;
  background-color: ${props => props.theme.addMembers.backgroundColor };
`;

const HeaderBackIcon = styled.View`
  margin-right: 15px;
`;

const HeaderTitle = styled.View`
  justify-content: center;
  flex-grow: 8;
`;

const HeaderTitleText = styled.Text`
  color: ${props => props.theme.conversationList.header.titleColor };
  text-transform: capitalize;
  font-weight: bold;
  font-size: 15px;
`;

const HeaderIcons = styled.View`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const SelectedMembersContainer = styled.View`
  display: flex;
  flex-direction: row;
  margin-left: 15px;
  margin-right: 15px;
  margin-bottom: 15px; 
`;

const SuggestedText = styled.Text`
  color: ${props => props.theme.colors.textGrey };
  text-transform: capitalize;
  padding-left: 15px;
  padding-bottom: 15px;
`;

const ContactDisplayNameText = styled.Text`
  color: ${props => props.theme.addMembers.user.displayNameColor };
  font-weight: bold;
`;

class AddMembers extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      search: '',
      showSearchBar: false,
      selectedMembers: []
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
    let { client, list, conversation } = this.props;

    if (!list.length) {
      list = conversation.members;
    }
    const skipUserIds = list.map(user => user.userId);

    // Load friends list
    let friendListQuery = client.User.createUserListQuery();
    friendListQuery.limit = 50;
    friendListQuery.skip = 0;
    friendListQuery.skipUserIds = skipUserIds;
    friendListQuery.sort = 'isOnline DESC, displayName ASC ';
    this.props.getFriendsList(friendListQuery);
  }

  _renderContact = rowData => {
    const { theme } = this.props;
    const member = rowData.item;
    let { selectedMembers } = this.state;
    const checked = selectedMembers.findIndex(item => item.id == member.id)

    return (
      <ListItem
        component={TouchableHighlight}
        containerStyle={{ backgroundColor: theme.addMembers.backgroundColor }}
        key={member.id}
        leftAvatar={this._getContactAvatar(member)}
        title={this._renderDisplayName(member)}
        titleStyle={{ fontWeight: '500', fontSize: 16 }}
        checkBox={{checked: checked >= 0 ? true : false, onPress: () => this._onContactPress(member)}}
        onPress={() => this._onContactPress(member)}
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

  _renderDisplayName = user => {
    let title;
    if (user) {
      title = capitalize(user.displayName);
    } else {
      title = "Deleted Member";
    }

    return (
      <View>
        <ContactDisplayNameText numberOfLines={1}>{title}</ContactDisplayNameText>
      </View>
    );
  }

  _renderSelectedContact = rowData => {
    const { theme } = this.props;
    const user = rowData.item;

    let avatarUrl;
    let avatarTitle;

    if (user) {
      avatarTitle = user.displayName;
      if (user.profileImageUrl) {
        avatarUrl = user.profileImageUrl;
      }
    } else {
      avatarTitle = "Deleted User"
    }

    return (
      <TouchableOpacity style={{marginRight: 15}} onPress={() => this._removeFromSelectedMembers(user)}>   
        <Avatar 
          size="medium"
          title={avatarTitle}
          source={avatarUrl}
          accessory={{
            name: 'close',
            type: 'ionicons',
            color: theme.colors.danger
          }}
          showAccessory={true}
        />
      </TouchableOpacity>
    )
  }

  back = () => {
    const { onBack } = this.props;
    const { showSearchBar } = this.state;

    if (showSearchBar) {
      this.setState({showSearchBar: false})
      return
    }

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
    friendListQuery.sort = 'isOnline DESC, displayName ASC ';
    this.props.searchFriendList(friendListQuery);
  }

  _onContactPress = user => {
    let { selectedMembers } = this.state;

    const index = selectedMembers.findIndex(member => member.id == user.id);
    if (index < 0) {
      selectedMembers = selectedMembers.concat(user)
      this.setState({selectedMembers: selectedMembers})
    } else {
      this._removeFromSelectedMembers(user);
    }
  }

  _removeFromSelectedMembers = (user) => {
    var selectedMembers = [...this.state.selectedMembers];

    const index = selectedMembers.findIndex(member => member.id == user.id);
    if (index >= 0) {
      selectedMembers.splice(index, 1);
      this.setState({selectedMembers: selectedMembers})
    }
  }

  _toggleSearchInput = () => {
    const { showSearchBar } = this.state;
    this.setState(state => ({
      showSearchBar: !state.showSearchBar
    }))
  }

  _addMembers = () => {
    console.log("Add members");
    const { conversation } = this.props;
    const { selectedMembers } = this.state;
    const memberIds = selectedMembers.map(member => member.id)

    this.props.addMembers(conversation, memberIds)
    this.back();
  }

  render() {
    let {
      theme, 
      conversation,
      friendList,
      loading,
      searching,
      searchedFriendList,
      error,
      client,
      connected,
      connecting
    } = this.props;
    const { search, selectedMembers, showSearchBar } = this.state;

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
    }

    const user = client.getCurrentUser();

    let headerStyle = {
      shadowColor: "#000",
      shadowOpacity: 0.18,
      shadowRadius: 1.00,
      elevation: 1
    }

    if (!showSearchBar) {
      headerStyle['padding'] = 10;
    } else {
      headerStyle['paddingLeft'] = 10;
    }

    return (
      <Container>
        <Header style={headerStyle}>
          <HeaderBackIcon>
            <TouchableOpacity onPress={this.back}>
              <Icon 
                name ="md-arrow-back" 
                size={30} 
                color={theme.colors.primary}
              />
            </TouchableOpacity>
          </HeaderBackIcon>
          { !showSearchBar && 
            <React.Fragment>
              <HeaderTitle>
                <HeaderTitleText>Add Members</HeaderTitleText>
              </HeaderTitle>
              <HeaderIcons>
                <TouchableOpacity onPress={this._toggleSearchInput}>
                  <Icon 
                    name ="ios-search" 
                    size={30} 
                    color={theme.colors.primary}
                  />
                </TouchableOpacity>
                { selectedMembers.length > 0 &&
                  <React.Fragment>
                    <TouchableOpacity style={{marginLeft: 10}} onPress={this._addMembers}>
                      <Icon 
                        name ="md-checkmark"
                        size={30} 
                        color={theme.colors.primary}
                      />
                    </TouchableOpacity>
                  </React.Fragment>
                }
              </HeaderIcons>
            </React.Fragment>
          }
          { showSearchBar &&
            <SearchBar
              containerStyle={{width: "90%"}}
              placeholder="Search"
              searchIcon={false}
              cancelIcon={false}
              platform={Platform.OS}
              onClear={this._resetSearch}
              onChangeText={this._onChangeSearch}
              value={search}
            />
          }
        </Header>

        {!connecting && !connected && 
          <View>
            <Text>Disconnected</Text>
          </View>
        }

        <SelectedMembersContainer>
          <FlatList
            renderItem={this._renderSelectedContact}
            data={selectedMembers}
            showsHorizontalScrollIndicator={false}
            horizontal={true}
            extraData={true}
            keyExtractor={(item, index) => item.id}
          />
        </SelectedMembersContainer>

        <React.Fragment>
          <SuggestedText>Suggested</SuggestedText>
          <ContactsContainer>
            { (loading || searching) && 
                <View>
                  <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            }
            { (!loading && !searching) &&
              <FlatList
                renderItem={this._renderContact}
                data={friendList}
                extraData={true}
                keyExtractor={(item, index) => item.id}
                ListEmptyComponent={<Text>No contacts Found</Text>}
              />
            }
          </ContactsContainer>
        </React.Fragment>
      </Container>
    )
  }
};

function mapStateToProps({ client, user, member }, ownProps) {
  let props = {...user, ...member, ...client};
  const mergedProps = { ...props, ...ownProps };
  return {...mergedProps}
}

AddMembers = withChannelizeContext(
 theme(AddMembers)
);

export default connect(
  mapStateToProps,
  {
    loadOnlineFriends,
    getFriendsList,
    searchFriendList,
    addMembers
  }
)(AddMembers);