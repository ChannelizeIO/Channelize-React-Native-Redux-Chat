import React, { PureComponent } from 'react';
import { Platform, ScrollView, View, Image, TouchableHighlight, TouchableOpacity, Text, FlatList, ActivityIndicator } from 'react-native';
import { Icon } from 'react-native-elements';
import {
  loadOnlineFriends,
  getFriendsList,
  searchFriendList,
  setActiveUserId
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
  background-color: ${props => props.theme.contactList.backgroundColor };
  display: flex;
  flex-direction: column;
`;

const Header = styled.View`
  padding-left: 10px;
  flex-direction: row;
  background-color: ${props => props.theme.contactList.backgroundColor };
  align-items: center;
  justify-content: center;
`;

const ContactsContainer = styled.View`
  width: 100%;
  background-color: ${props => props.theme.contactList.backgroundColor };
`;

const HeaderBackIcon = styled.View`
  margin-right: 10px;
`;

const SuggestedText = styled.Text`
  color: ${props => props.theme.colors.textGrey };
  text-transform: capitalize;
  padding-left: 15px;
  padding-bottom: 15px;
  padding-top: 15px;
`;

const ContactDisplayNameText = styled.Text`
  color: ${props => props.theme.contactList.user.displayNameColor };
  font-weight: bold;
`;

class ContactList extends PureComponent {
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
        containerStyle={{ backgroundColor: theme.contactList.backgroundColor }}
        key={member.id}
        leftAvatar={this._getContactAvatar(member)}
        title={this._renderDisplayName(member)}
        titleStyle={{ fontWeight: '500', fontSize: 16 }}
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
    friendListQuery.sort = 'isOnline DESC, displayName ASC ';
    this.props.searchFriendList(friendListQuery);
  }

  _onContactPress = user => {
    const { onContactClick } = this.props;

    this.props.setActiveUserId(user.id);
    if (onContactClick && typeof onContactClick == 'function') {
      onContactClick(user.id)
    }
  }

  render() {
    let {
      theme, 
      friendList,
      loading,
      searching,
      searchedFriendList,
      error,
      client,
      connected,
      connecting
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
              backgroundColor: theme.contactList.searchBar.backgroundColor,
            }}
            inputStyle={{
              color: theme.contactList.searchBar.inputTextColor
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
        </Header>

        {!connecting && !connected && 
          <View>
            <Text>Disconnected</Text>
          </View>
        }

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

function mapStateToProps({ client, user }, ownProps) {
  let props = {...user, ...client};
  const mergedProps = { ...props, ...ownProps };
  return {...mergedProps}
}

ContactList = withChannelizeContext(
 theme(ContactList)
);

export default connect(
  mapStateToProps,
  {
    loadOnlineFriends,
    getFriendsList,
    searchFriendList,
    setActiveUserId
  }
)(ContactList);