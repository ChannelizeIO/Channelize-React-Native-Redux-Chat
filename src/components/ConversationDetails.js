import React, { PureComponent } from 'react';
import { ScrollView, View, Image, TouchableHighlight, TouchableOpacity, Text, FlatList, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  getMembers,
  muteConversation,
  unmuteConversation,
  leaveConversation,
  deleteConversation,
  updateTitle,
  block,
  unblock
} from '../actions';
import { withChannelizeContext } from '../context';
import { theme } from '../styles/theme';
import styled from 'styled-components/native';
import { connect } from 'react-redux';
import { capitalize, dateTimeParser } from '../utils';
import { ListItem, Button, Input } from 'react-native-elements';
import Avatar from './Avatar'

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
      title: null
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
    const { client, connected, conversation } = this.props;
    if (!connected) {
      return
    }

    if (!conversation) {
      return
    }

    if ((!prevProps.conversation && conversation) || (prevProps.conversation.id != conversation.id)) {
      this._init();
    }
  }

  _init = () => {
    const { client, conversation } = this.props;
    if (!conversation) {
      return
    }

    // Load members
    if (conversation.isGroup) {
      if (!conversation.members.length) {
        this.props.getMembers(conversation);
      }
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

  _updateTitle = () => {
    const { title } = this.state;
    const { conversation } = this.props;
    this.props.updateTitle(conversation, title);
    this._toggleInput();
  }

  _renderMember = rowData => {
    const { theme } = this.props;
    const member = rowData.item;
    return (
      <ListItem
        component={TouchableHighlight}
        containerStyle={{ backgroundColor: theme.ConversationDetails.member.backgroundColor }}
        key={member.id}
        leftAvatar={this._getMemberAvatar(member)}
        title={this._renderDisplayName(member)}
        titleStyle={{ fontWeight: '500', fontSize: 16 }}
        rightTitle={this._renderMemberRole(member)}
        subtitleStyle={{ fontWeight: '300', fontSize: 11 }}
        onPress={() => this._onMemberPress(member)}
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
    console.log("Add Members");
    const { onAddMembersClick, conversation } = this.props;
    if (onAddMembersClick && typeof onAddMembersClick == 'function') {
      onAddMembersClick(conversation);
    }
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

  _leaveConversation = () => {
    const { conversation } = this.props;
    this.props.leaveConversation(conversation)
  }

  _deleteConversation = () => {
    const { conversation } = this.props;
    this.props.deleteConversation(conversation)
  }

  _onMemberPress = member => {
    console.log("_onMemberPress");
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
      connecting
    } = this.props;
    const { showInput, title } = this.state;
    if (connecting) {
      return null;
    }

    if (!conversation) {
      return null;
    }

    if (!list.length) {
      list = conversation.members;
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
                name ="md-arrow-back" 
                size={30} 
                color={theme.colors.primary}
              />
            </TouchableOpacity>
          </HeaderBackIcon>
        </Header>

        {!connecting && !connected && 
          <View>
            <Text>Disconnected</Text>
          </View>
        }

        <ConversationDetailsContainer>
          <Avatar size="xlarge" title={headerTitle} source={headerImage}/>
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
                    name ="md-checkmark" 
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
                    name ="md-create" 
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
          {!conversation.mute && 
            <ListItem
              component={TouchableHighlight}
              containerStyle={{ backgroundColor: theme.ConversationDetails.primaryActionButtons.backgroundColor }}
              title={<PrimaryActionButtonText>Mute Conversation</PrimaryActionButtonText>}
              titleStyle={{ fontWeight: '500', fontSize: 16 }}
              onPress={this._muteConversation}
            />
          }
          {conversation.mute &&
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
              onPress={this._leaveConversation}
            />
          }
          {!conversation.isGroup && conversation.isActive &&
            <ListItem
              component={TouchableHighlight}
              containerStyle={{ backgroundColor: theme.ConversationDetails.primaryActionButtons.backgroundColor }}
              title={<PrimaryActionButtonText>Block</PrimaryActionButtonText>}
              titleStyle={{ fontWeight: '500', fontSize: 16 }}
              onPress={this._block}
            />
          }
          {!conversation.isGroup && !conversation.isActive &&
            <ListItem
              component={TouchableHighlight}
              containerStyle={{ backgroundColor: theme.ConversationDetails.primaryActionButtons.backgroundColor }}
              title={<PrimaryActionButtonText>UnBlock</PrimaryActionButtonText>}
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
            onPress={this._deleteConversation}
          />
        </RedActionButtonsContainer>
      </Container>
    )
  }
};

function mapStateToProps({ client, member, user }, ownProps) {
  let props = {...member, ...client};
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
    updateTitle
  }
)(ConversationDetails);