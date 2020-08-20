import React, { PureComponent } from 'react';
import { ScrollView, View, Image, TouchableHighlight, TouchableOpacity, Text, FlatList, ActivityIndicator, Alert } from 'react-native';
import { Icon } from 'react-native-elements';
import {
  getMembers,
  muteConversation,
  unmuteConversation,
  leaveConversation,
  deleteConversation,
  updateTitle,
  updateProfilePhoto,
  block,
  unblock,
  removeMembers,
  addAdmin,
  removeAdmin
} from '../actions';
import { withChannelizeContext } from '../context';
import { theme } from '../styles/theme';
import styled from 'styled-components/native';
import { connect } from 'react-redux';
import { capitalize, dateTimeParser } from '../utils';
import { ListItem, Button, Input } from 'react-native-elements';
import Avatar from './Avatar'
import Overlay from './Overlay';
import { pickImage } from '../native';

const Container = styled.ScrollView`
  position: absolute;
  top: 0px;
  height: 100%;
  width: 100%;
  background-color: ${props => props.theme.ConversationDetails.backgroundColor };
  display: flex;
  flex-direction: column;
`;

const Header = styled.View`
  padding: 10px;
  flex-direction: row;
`;

const MembersContainer = styled.View`
  width: 100%;
  background-color: ${props => props.theme.ConversationDetails.member.backgroundColor };
`;

const PrimaryActionButtonsContainer = styled.View`
  margin-top: 50px;
  width: 100%;
  background-color: ${props => props.theme.ConversationDetails.primaryActionButtons.backgroundColor };
`;

const RedActionButtonsContainer = styled.View`
  margin-top: 50px;
  width: 100%;
  background-color: ${props => props.theme.ConversationDetails.redActionButtons.backgroundColor };
`;

const HeaderBackIcon = styled.View`
  margin-right: 10px;
`;

const HeaderErrorMessage = styled.View`
  margin-top: 10px;
  flex-direction: row;
  justify-content: center; 
`;

const HeaderErrorMessageText = styled.Text`
  color: ${props => props.theme.colors.danger };
`;

const ConversationDetailsContainer = styled.View`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ConversationTitleContainer = styled.View`
  display: flex;
  flex-direction: row;
`;

const ConversationTitleText = styled.Text`
  color: ${props => props.theme.ConversationDetails.details.titleColor };
  font-weight: bold;
  font-size: 20px;
  margin-right: 10px;
`;

const EditIcon = styled.View`
`;

const MembersText = styled.Text`
  color: ${props => props.theme.colors.textGrey };
  text-transform: capitalize;
  margin-top: 50px;
  padding-left: 15px;
  padding-bottom: 15px;
`;

const MemberDisplayNameText = styled.Text`
  color: ${props => props.theme.ConversationDetails.member.displayNameColor };
  font-weight: bold;
`;

const MemberRoleNameText = styled.Text`
  color: ${props => props.theme.ConversationDetails.member.roleColor };
`;

const PrimaryActionButtonText = styled.Text`
  color: ${props => props.theme.ConversationDetails.primaryActionButtons.buttonTitleColor };
`;

const RedActionButtonText = styled.Text`
  color: ${props => props.theme.ConversationDetails.redActionButtons.buttonTitleColor };
`;

class ConversationDetails extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      showInput: false,
      title: null,
      deleted: false,
      pressedMember: null
    }
  }

  componentDidMount() {
    const { connected } = this.props;
    if (!connected) {
      return
    }

    this._init();
  }

  componentDidUpdate(prevProps) {
    const { 
      client,
      connected,
      conversation,
      actionInProcess,
      onConversationDeleted
     } = this.props;
    if (!connected) {
      return
    }

    if (!conversation) {
      return
    }

    if ((!prevProps.conversation && conversation) || (prevProps.conversation.id != conversation.id)) {
      this._init();
    }

    // on successful conversation deleted
    const { deleted } = this.state;
    if (deleted && (prevProps.actionInProcess && !actionInProcess)) {
      if (onConversationDeleted && typeof onConversationDeleted == 'function') {
        onConversationDeleted(conversation);
      }
    }
  }

  _init = () => {
    const { client, conversation } = this.props;
    if (!conversation) {
      return
    }

    // Load members
    if (conversation.isGroup) {
      this.props.getMembers(conversation);
      this.setState({title: conversation.title});
    }
  }

  _toggleInput = () => {
    this.setState((state) => ({
      showInput: !state.showInput
    }));
  }

  _onChangeTitle = (value) => {
    this.setState({title: value})
  }

  _updateProfilePhoto = () => {
    const { client, conversation, connected } = this.props;
    if (!connected || !conversation.isGroup || !conversation.isAdmin) {
      return
    }

    pickImage((err, file) => {
      if (err || !file || file.didCancel) {
        return;
      }

      this.props.updateProfilePhoto(client, conversation, file);
    })
  }

  _updateTitle = () => {
    const { title } = this.state;
    const { conversation } = this.props;
    this.props.updateTitle(conversation, title);
    this._toggleInput();
  }

  _renderMember = rowData => {
    const { theme, client } = this.props;
    const member = rowData.item;
    const user = client.getCurrentUser();

    return (
      <ListItem
        component={user.id != member.userId ? TouchableHighlight : null}
        containerStyle={{ backgroundColor: theme.ConversationDetails.member.backgroundColor }}
        key={member.id}
        leftAvatar={this._getMemberAvatar(member)}
        title={this._renderDisplayName(member)}
        titleStyle={{ fontWeight: '500', fontSize: 16 }}
        rightTitle={this._renderMemberRole(member)}
        subtitleStyle={{ fontWeight: '300', fontSize: 11 }}
        onPress={user.id != member.userId ? () => this._togglePressedMember(member) : null}
      />
    );
  };

  _getMemberAvatar = member => {
    const { theme } = this.props;

    let avatarUrl;
    let avatarTitle;

    if (member.user) {
      avatarTitle = member.user.displayName;
      if (member.user.profileImageUrl) {
        avatarUrl = member.user.profileImageUrl;
      }
    } else {
      avatarTitle = "Deleted User"
    }

    return (
      <Avatar 
        title={avatarTitle}
        source={avatarUrl}
      />)
  }

  _renderMemberRole = member => {
    let role = member.isAdmin ? 'Admin' : null; 

    if (!role) {
      return null;
    }

    return (
      <View>
        <MemberRoleNameText>{role}</MemberRoleNameText>
      </View>
    );
  }

  _renderDisplayName = member => {
    let title;
    if (member.user) {
      title = capitalize(member.user.displayName);
    } else {
      title = "Deleted Member";
    }

    return (
      <View>
        <MemberDisplayNameText numberOfLines={1}>{title}</MemberDisplayNameText>
      </View>
    );
  }

  back = () => {
    const { onBack } = this.props;
    if (onBack && typeof onBack == 'function') {
      onBack()
    }
  }

  _addMembers = () => {
    const { onAddMembersClick, conversation } = this.props;
    if (onAddMembersClick && typeof onAddMembersClick == 'function') {
      onAddMembersClick(conversation);
    }
  }

  _removeMembers = (member) => {
    const { conversation } = this.props;
    this.props.removeMembers(conversation, [member.user.id]);
    this._togglePressedMember();
  }

  _addAdmin = (member) => {
    const { conversation } = this.props;
    this.props.addAdmin(conversation, member.user.id)
    this._togglePressedMember();
  }

  _removeAdmin = (member) => {
    const { conversation } = this.props;
    this.props.removeAdmin(conversation, member.user.id)
    this._togglePressedMember();
  }

  _showBlockAlert = () => {
    Alert.alert(
      '',
      'Are you sure you want to block this user? The blocked contact will no longer able to send messages.',
      [
        {
          text: 'CANCEL',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel'
        },
        { text: 'BLOCK', onPress: this._block }
      ],
      { cancelable: false }
    );
  }

  _block = () => {
    const { client, conversation } = this.props;
    if (conversation.isGroup) {
      return;
    }

    this.props.block(client, conversation.user.id)
  }

  _unblock = () => {
    const { client, conversation } = this.props;
    if (conversation.isGroup) {
      return;
    }

    this.props.unblock(client, conversation.user.id)
  }

  _muteConversation = () => {
    const { conversation } = this.props;
    this.props.muteConversation(conversation)
  }

  _unmuteConversation = () => {
    const { conversation } = this.props;
    this.props.unmuteConversation(conversation)
  }

  _showLeaveConversationAlert = () => {
    Alert.alert(
      '',
      'Are you sure you want to leave this group? You will no longer receive new messages.',
      [
        {
          text: 'CANCEL',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel'
        },
        { text: 'LEAVE', onPress: this._leaveConversation }
      ],
      { cancelable: false }
    );
  }

  _leaveConversation = () => {
    const { conversation } = this.props;
    this.props.leaveConversation(conversation)
  }

  _showDeleteConversationAlert = () => {
    Alert.alert(
      '',
      'Are you sure you want to delete this conversation? Once deleted, it cannot be undone..',
      [
        {
          text: 'CANCEL',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel'
        },
        { text: 'Delete', onPress: this._deleteConversation }
      ],
      { cancelable: false }
    );
  }

  _deleteConversation = () => {
    const { conversation } = this.props;
    this.props.deleteConversation(conversation)

    this.setState({deleted: true})
  }

  _togglePressedMember = member => {
    this.setState(prevState => ({
      pressedMember: prevState.pressedMember ? null : member
    }))
  }

  render() {
    let {
      theme, 
      conversation,
      list,
      loading,
      error,
      client,
      connected,
      connecting,
      actionInProcess,
      userActionInProcess
    } = this.props;
    const { showInput, title, pressedMember } = this.state;
    if (connecting) {
      return null;
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
    return (
      <Container>
        <Header>
          <HeaderBackIcon>
            <TouchableOpacity onPress={this.back}>
              <Icon 
                name ="arrow-back" 
                size={30} 
                color={theme.colors.primary}
              />
            </TouchableOpacity>
          </HeaderBackIcon>
          {!connecting && !connected && 
            <HeaderErrorMessage>
              <HeaderErrorMessageText>Disconnected</HeaderErrorMessageText>
            </HeaderErrorMessage>
          }
        </Header>

        {(userActionInProcess || actionInProcess) && 
          <Overlay>
            <Text>Please wait...</Text>
          </Overlay>
        }

        { pressedMember && conversation.isGroup && conversation.isAdmin &&
          <Overlay 
            style={{ width: '80%'}}
            onBackDropPress={() => this._togglePressedMember(pressedMember)}
          >
            <ListItem
              component={TouchableHighlight}
              key="remove-members"
              title={`Remove ${capitalize(pressedMember.user.displayName)}`}
              onPress={() => this._removeMembers(pressedMember)}
            />
            { !pressedMember.isAdmin &&
              <ListItem
                component={TouchableHighlight}
                key="make-group-admin"
                title="Make Group Admin"
                onPress={() => this._addAdmin(pressedMember)}
              />
            }
            { pressedMember.isAdmin &&
              <ListItem
                component={TouchableHighlight}
                key="remove-as-admin"
                title="Remove as admin"
                onPress={() => this._removeAdmin(pressedMember)}
              />
            }
          </Overlay>
        }

        <ConversationDetailsContainer>
          <Avatar 
            size="xlarge"
            title={headerTitle}
            source={headerImage}
            onPress={this._updateProfilePhoto}
          />
          {showInput && conversation.isGroup && conversation.isAdmin &&
            <View style={{width: "100%"}}>
              <Input
                value={title}
                autoFocus={true}
                onChangeText={this._onChangeTitle}
                inputStyle={{
                  color: theme.createGroup.input.color
                }}
                rightIcon={
                 <TouchableOpacity onPress={this._updateTitle}>
                  <Icon 
                    name ="check" 
                    size={25} 
                    color={theme.colors.primary}
                  />
                 </TouchableOpacity>
                }
              />
            </View>
          }

          {!showInput &&
            <ConversationTitleContainer>
              <ConversationTitleText>{headerTitle}</ConversationTitleText>
              { conversation.isGroup && conversation.isAdmin &&
                <TouchableOpacity onPress={this._toggleInput}>
                  <Icon 
                    name ="edit" 
                    size={25} 
                    color={theme.colors.primary}
                  />
                </TouchableOpacity>
              }
            </ConversationTitleContainer>
          }
        </ConversationDetailsContainer>

        { conversation.isGroup && conversation.isAdmin &&
          <PrimaryActionButtonsContainer>
            <ListItem
              component={TouchableHighlight}
              containerStyle={{ backgroundColor: theme.ConversationDetails.primaryActionButtons.backgroundColor }}
              title={<PrimaryActionButtonText>Add Members</PrimaryActionButtonText>}
              titleStyle={{ fontWeight: '500', fontSize: 16 }}
              onPress={this._addMembers}
            />
          </PrimaryActionButtonsContainer>
        }

        { conversation.isGroup &&
          <React.Fragment>
            <MembersText>Members</MembersText>
            <MembersContainer>
              { loading &&
                  <View>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                  </View>
              }
              { !loading &&
                <FlatList
                  renderItem={this._renderMember}
                  data={list}
                  extraData={true}
                  keyExtractor={(item, index) => item.id}
                  ListEmptyComponent={<Text>No Members Found</Text>}
                />
              }
            </MembersContainer>
          </React.Fragment>
        }

        <PrimaryActionButtonsContainer>
          { conversation.isActive && !conversation.mute && 
            <ListItem
              component={TouchableHighlight}
              containerStyle={{ backgroundColor: theme.ConversationDetails.primaryActionButtons.backgroundColor }}
              title={<PrimaryActionButtonText>Mute Conversation</PrimaryActionButtonText>}
              titleStyle={{ fontWeight: '500', fontSize: 16 }}
              onPress={this._muteConversation}
            />
          }
          { conversation.isActive && conversation.mute &&
            <ListItem
              component={TouchableHighlight}
              containerStyle={{ backgroundColor: theme.ConversationDetails.primaryActionButtons.backgroundColor }}
              title={<PrimaryActionButtonText>Unmute Conversation</PrimaryActionButtonText>}
              titleStyle={{ fontWeight: '500', fontSize: 16 }}
              onPress={this._unmuteConversation}
            />
          }
          {conversation.isGroup && conversation.isActive &&
            <ListItem
              component={TouchableHighlight}
              containerStyle={{ backgroundColor: theme.ConversationDetails.primaryActionButtons.backgroundColor }}
              title={<PrimaryActionButtonText>Leave Conversation</PrimaryActionButtonText>}
              titleStyle={{ fontWeight: '500', fontSize: 16 }}
              onPress={this._showLeaveConversationAlert}
            />
          }
          {!conversation.isGroup && conversation.isActive &&
            <ListItem
              component={TouchableHighlight}
              containerStyle={{ backgroundColor: theme.ConversationDetails.primaryActionButtons.backgroundColor }}
              title={<PrimaryActionButtonText>Block</PrimaryActionButtonText>}
              titleStyle={{ fontWeight: '500', fontSize: 16 }}
              onPress={this._showBlockAlert}
            />
          }
          {!conversation.isGroup && !conversation.isActive &&
            <ListItem
              component={TouchableHighlight}
              containerStyle={{ backgroundColor: theme.ConversationDetails.primaryActionButtons.backgroundColor }}
              title={<PrimaryActionButtonText>Unblock</PrimaryActionButtonText>}
              titleStyle={{ fontWeight: '500', fontSize: 16 }}
              onPress={this._unblock}
            />
          }
        </PrimaryActionButtonsContainer>

        <RedActionButtonsContainer>
          <ListItem
            component={TouchableHighlight}
            containerStyle={{ backgroundColor: theme.ConversationDetails.redActionButtons.backgroundColor }}
            title={<RedActionButtonText>Delete Conversation</RedActionButtonText>}
            titleStyle={{ fontWeight: '500', fontSize: 16 }}
            onPress={this._showDeleteConversationAlert}
          />
        </RedActionButtonsContainer>
      </Container>
    )
  }
};

function mapStateToProps({ client, member, user }, ownProps) {
  let props = {...member, ...client, userActionInProcess: user.actionInProcess};
  const mergedProps = { ...props, ...ownProps };
  return {...mergedProps}
}

ConversationDetails = withChannelizeContext(
 theme(ConversationDetails)
);

export default connect(
  mapStateToProps,
  {
    block,
    unblock,
    getMembers,
    muteConversation,
    unmuteConversation,
    leaveConversation,
    deleteConversation,
    updateTitle,
    updateProfilePhoto,
    removeMembers,
    addAdmin,
    removeAdmin
  }
)(ConversationDetails);