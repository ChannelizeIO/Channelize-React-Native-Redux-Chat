import {
  SET_ACTIVE_CONVERSATION,
  LOADING_MEMBERS,
  LIST_MEMBERS_FAIL,
  LIST_MEMBERS_SUCCESS,
  ADDING_MEMBERS,
  ADD_MEMBERS_FAIL,
  ADD_MEMBERS_SUCCESS,
  PROCESS_MUTE_CONVERSATION,
  MUTE_CONVERSATION_FAIL,
  MUTE_CONVERSATION_SUCCESS,
  PROCESS_UNMUTE_CONVERSATION,
  UNMUTE_CONVERSATION_FAIL,
  UNMUTE_CONVERSATION_SUCCESS,
  PROCESS_LEAVE_CONVERSATION,
  LEAVE_CONVERSATION_FAIL,
  LEAVE_CONVERSATION_SUCCESS,
  PROCESS_DELETE_CONVERSATION,
  DELETE_CONVERSATION_FAIL,
  DELETE_CONVERSATION_SUCCESS,
  PROCESS_UPDATE_TITLE,
  UPDATE_TITLE_FAIL,
  UPDATE_TITLE_SUCCESS,
  REMOVING_MEMBERS,
  REMOVE_MEMBERS_FAIL,
  REMOVE_MEMBERS_SUCCESS,
  ADDING_ADMIN,
  ADD_ADMIN_FAIL,
  ADD_ADMIN_SUCCESS,
  REMOVING_ADMIN,
  REMOVE_ADMIN_FAIL,
  REMOVE_ADMIN_SUCCESS,
  UPDATING_PROFILE_PHOTO,
  UPDATE_PROFILE_PHOTO_FAIL,
  UPDATE_PROFILE_PHOTO_SUCCESS,
  MEMBERS_ADDED_EVENT,
  MEMBERS_REMOVED_EVENT,
  USER_BLOCKED_EVENT,
  USER_UNBLOCKED_EVENT,
  USER_REMOVED_EVENT,
  USER_CONVERSATION_DELETED_EVENT,
  CONVERSATION_UPDATED_EVENT,
  ADMIN_ADDED_EVENT,
  ADMIN_REMOVED_EVENT
} from '../constants';
import { createReducer, uniqueList } from '../utils';
import { Channelize } from 'channelize-chat';

const INITIAL_STATE = {
  list: [],
  loading: false,
  error: null,

  // Active conversation
  conversation: null,

  // When any action is in process
  actionInProcess: false
};

export const setActiveConversation = (state, action) => {
  state.conversation = action.payload;
  state.list = [];
};

export const loadingMembers = (state, action) => {
  state.loading = true;
};

export const listMembersSuccess = (state, action) => {
  state.loading = false;
  state.list = action.payload;
};

export const listMembersFail = (state, action) => {
  state.loading = false;
  state.error = action.payload;
};

export const processMuteConversation = (state, action) => {
  state.actionInProcess = true;
};

export const muteConversationSuccess = (state, action) => {
  state.actionInProcess = false;
  if (state.conversation) {
    const jsonConversation = state.conversation.toJSON();
    jsonConversation.mute = true;

    const client = Channelize.client.getInstance();
    state.conversation = new Channelize.core.Conversation.Model(client, jsonConversation);
  }
};

export const muteConversationFail = (state, action) => {
  state.actionInProcess = false;
  state.error = action.payload;
};

export const processUnmuteConversation = (state, action) => {
  state.actionInProcess = true;
};

export const unmuteConversationSuccess = (state, action) => {
  state.actionInProcess = false;
  if (state.conversation) {
    const jsonConversation = state.conversation.toJSON();
    jsonConversation.mute = false;

    //Convert in conversation model
    const client = Channelize.client.getInstance();
    state.conversation = new Channelize.core.Conversation.Model(client, jsonConversation);
  }
};

export const unmuteConversationFail = (state, action) => {
  state.actionInProcess = false;
  state.error = action.payload;
};

export const processLeaveConversation = (state, action) => {
  state.actionInProcess = true;
};

export const leaveConversationSuccess = (state, action) => {
  state.actionInProcess = false;
};

export const leaveConversationFail = (state, action) => {
  state.actionInProcess = false;
  state.error = action.payload;
};

export const processDeleteConversation = (state, action) => {
  state.actionInProcess = true;
};

export const deleteConversationSuccess = (state, action) => {
  state.actionInProcess = false;
};

export const deleteConversationFail = (state, action) => {
  state.actionInProcess = false;
  state.error = action.payload;
};

export const processUpdateTitle = (state, action) => {
  state.actionInProcess = true;
};

export const addingMembers = (state, action) => {
  state.actionInProcess = true;
};

export const addMembersFail = (state, action) => {
  state.actionInProcess = false;
  state.error = action.payload;
};

export const addMembersSuccess = (state, action) => {
  state.actionInProcess = false;
};

export const removingMembers = (state, action) => {
  state.actionInProcess = true;
};

export const removeMembersFail = (state, action) => {
  state.actionInProcess = false;
  state.error = action.payload;
};

export const removeMembersSuccess = (state, action) => {
  state.actionInProcess = false;
};

export const addingAdmin = (state, action) => {
  state.actionInProcess = true;
};

export const addAdminFail = (state, action) => {
  state.actionInProcess = false;
  state.error = action.payload;
};

export const addAdminSuccess = (state, action) => {
  state.actionInProcess = false;
};

export const removingAdmin = (state, action) => {
  state.actionInProcess = true;
};

export const removeAdminFail = (state, action) => {
  state.actionInProcess = false;
  state.error = action.payload;
};

export const removeAdminSuccess = (state, action) => {
  state.actionInProcess = false;
};

export const updateTitleSuccess = (state, action) => {
  state.actionInProcess = false;
  if (state.conversation) {
    const jsonConversation = state.conversation.toJSON();
    jsonConversation.title = action.payload.title;

    const client = Channelize.client.getInstance();
    state.conversation = new Channelize.core.Conversation.Model(client, jsonConversation);
  }
};

export const updateTitleFail = (state, action) => {
  state.actionInProcess = false;
  state.error = action.payload;
};

export const updatingProfilePhoto = (state, action) => {
  state.actionInProcess = true;
};

export const updateProfilePhotoSuccess = (state, action) => {
  state.actionInProcess = false;
};

export const updateProfilePhotoFail = (state, action) => {
  state.actionInProcess = false;
  state.error = action.payload;
};

export const adminAdded = (state, action) => {
  let { conversation, adminUser } = action.payload;
  const activeConversation = state.conversation;
  if (!activeConversation || activeConversation.id != conversation.id) {
    return
  }

  const jsonConversation = activeConversation.toJSON();

  jsonConversation.members = jsonConversation.members.map(member => {
    if (member.userId == adminUser.id) {
      member.isAdmin = true
    }
    return member
  });

  //Convert in conversation model
  const client = Channelize.client.getInstance();
  state.conversation = new Channelize.core.Conversation.Model(client, jsonConversation);
};

export const adminRemoved = (state, action) => {
  let { conversation, adminUser } = action.payload;
  const activeConversation = state.conversation;
  if (!activeConversation || activeConversation.id != conversation.id) {
    return
  }

  const jsonConversation = activeConversation.toJSON();

  jsonConversation.members = jsonConversation.members.map(member => {
    if (member.userId == adminUser.id) {
      member.isAdmin = false
    }
    return member
  });

  //Convert in conversation model
  const client = Channelize.client.getInstance();
  state.conversation = new Channelize.core.Conversation.Model(client, jsonConversation);
};

export const conversationUpdated = (state, action) => {
  let { id, title, profileImageUrl } = action.payload.conversation;
  if (state.conversation && state.conversation.id == id) {
    const jsonConversaton = state.conversation.toJSON();
    let conversation = {...jsonConversaton, title, profileImageUrl, updatedAt: action.payload.timestamp};

    //Convert in conversation model
    const client = Channelize.client.getInstance();
    state.conversation = new Channelize.core.Conversation.Model(client, conversation);
  }
};

export const membersAdded = (state, action) => {
  let { conversation, members, timestamp } = action.payload;

  const activeConversation = state.conversation;
  if (activeConversation && activeConversation.id == conversation.id) {
    let jsonConversation = state.conversation.toJSON();
    jsonConversation.members = jsonConversation.members.concat(members)
    jsonConversation.memberCount = conversation.memberCount;
    jsonConversation.updatedAt = timestamp;

    //Convert in conversation model
    const client = Channelize.client.getInstance();
    state.conversation = new Channelize.core.Conversation.Model(client, jsonConversation);

    state.list = [...members, ...state.list];
    state.list = uniqueList(state.list);
  }
};

export const membersRemoved = (state, action) => {
  let { conversation, members, timestamp } = action.payload;

  const activeConversation = state.conversation;
  if (activeConversation && activeConversation.id == conversation.id) {
    // Update conversation
    let jsonConversation = state.conversation.toJSON();
    jsonConversation.memberCount = conversation.memberCount;
    jsonConversation.updatedAt = timestamp;

    const client = Channelize.client.getInstance();
    state.conversation = new Channelize.core.Conversation.Model(client, jsonConversation);

    // Update list
    members.forEach(removedMember => {
      const index = state.list.findIndex(member => member.userId == removedMember.id)
      if (index >=0) {
        state.list.splice(index, 1);
      }
    })

    state.list = uniqueList(state.list);
  }
};

export const userRemoved = (state, action) => {
  let { conversation } = action.payload;

  const activeConversation = state.conversation;
  if (!activeConversation || activeConversation.id != conversation.id) {
    return
  }

  const client = Channelize.client.getInstance();

  let jsonConversation = activeConversation.toJSON();
  jsonConversation.isActive = false;
  jsonConversation.isAdmin = false;
  state.conversation = new Channelize.core.Conversation.Model(client, jsonConversation);
};

export const conversationDeleted = (state, action) => {
  let { conversation } = action.payload;

  const activeConversation = state.conversation;
  if (!activeConversation || activeConversation.id != conversation.id) {
    return
  }

  let jsonConversation = state.conversation.toJSON();
  jsonConversation.isDeleted = true;

  const client = Channelize.client.getInstance();
  state.conversation = new Channelize.core.Conversation.Model(client, jsonConversation);
};

export const userBlocked = (state, action) => {
  let { blocker, blockee } = action.payload;

  const activeConversation = state.conversation;
  if (!activeConversation || activeConversation.isGroup) {
    return
  }

  // If the current user is blocker
  // Or if current user is blocking another user
  const client = Channelize.client.getInstance();
  const user = client.getCurrentUser();
  if ([blocker.id, blockee.id].indexOf(user.id) < 0) {
    return
  }

  let jsonConversation = activeConversation.toJSON();
  if (user.id == blocker.id) {
    jsonConversation.isActive = false;
  } else {
    jsonConversation.user.isActive = false;
  }

  state.conversation = new Channelize.core.Conversation.Model(client, jsonConversation);
};

export const userUnblocked = (state, action) => {
  let { unblocker, unblockee } = action.payload;

  const activeConversation = state.conversation;
  if (!activeConversation || activeConversation.isGroup) {
    return
  }

  // If the current user is unblocker
  // Or if current user is unblocking another user
  const client = Channelize.client.getInstance();
  const user = client.getCurrentUser();
  if ([unblocker.id, unblockee.id].indexOf(user.id) < 0) {
    return
  }

  let jsonConversation = activeConversation.toJSON();
  if (user.id == unblocker.id) {
    jsonConversation.isActive = true;
  } else {
    jsonConversation.user.isActive = true;
  }

  state.conversation = new Channelize.core.Conversation.Model(client, jsonConversation);
};

export const handlers = {
  [SET_ACTIVE_CONVERSATION]: setActiveConversation,
  [LOADING_MEMBERS]: loadingMembers,
  [LIST_MEMBERS_FAIL]: listMembersFail,
  [LIST_MEMBERS_SUCCESS]: listMembersSuccess,
  [ADDING_MEMBERS]: addingMembers,
  [ADD_MEMBERS_FAIL]: addMembersFail,
  [ADD_MEMBERS_SUCCESS]: addMembersSuccess,
  [PROCESS_MUTE_CONVERSATION]: processMuteConversation,
  [MUTE_CONVERSATION_FAIL]: muteConversationFail,
  [MUTE_CONVERSATION_SUCCESS]: muteConversationSuccess,
  [PROCESS_UNMUTE_CONVERSATION]: processUnmuteConversation,
  [UNMUTE_CONVERSATION_FAIL]: unmuteConversationFail,
  [UNMUTE_CONVERSATION_SUCCESS]: unmuteConversationSuccess,
  [PROCESS_LEAVE_CONVERSATION]: processLeaveConversation,
  [LEAVE_CONVERSATION_FAIL]: leaveConversationFail,
  [LEAVE_CONVERSATION_SUCCESS]: leaveConversationSuccess,
  [PROCESS_DELETE_CONVERSATION]: processDeleteConversation,
  [DELETE_CONVERSATION_FAIL]: deleteConversationFail,
  [DELETE_CONVERSATION_SUCCESS]: deleteConversationSuccess,
  [PROCESS_UPDATE_TITLE]: processUpdateTitle,
  [UPDATE_TITLE_FAIL]: updateTitleFail,
  [UPDATE_TITLE_SUCCESS]: updateTitleSuccess,
  [UPDATING_PROFILE_PHOTO]: updatingProfilePhoto,
  [UPDATE_PROFILE_PHOTO_FAIL]: updateProfilePhotoFail,
  [UPDATE_PROFILE_PHOTO_SUCCESS]: updateProfilePhotoSuccess,
  [REMOVING_MEMBERS]: removingMembers,
  [REMOVE_MEMBERS_FAIL]: removeMembersFail,
  [REMOVE_MEMBERS_SUCCESS]: removeMembersSuccess,
  [ADDING_ADMIN]: addingAdmin,
  [ADD_ADMIN_FAIL]: addAdminFail,
  [ADD_ADMIN_SUCCESS]: addAdminSuccess,
  [REMOVING_ADMIN]: removingAdmin,
  [REMOVE_ADMIN_FAIL]: removeAdminFail,
  [REMOVE_ADMIN_SUCCESS]: removeAdminSuccess,
  [MEMBERS_ADDED_EVENT]: membersAdded,
  [MEMBERS_REMOVED_EVENT]: membersRemoved,
  [USER_BLOCKED_EVENT]: userBlocked,
  [USER_UNBLOCKED_EVENT]: userUnblocked,
  [USER_REMOVED_EVENT]: userRemoved,
  [USER_CONVERSATION_DELETED_EVENT]: conversationDeleted,
  [CONVERSATION_UPDATED_EVENT]: conversationUpdated,
  [ADMIN_ADDED_EVENT]: adminAdded,
  [ADMIN_REMOVED_EVENT]: adminRemoved,
};

export default createReducer(INITIAL_STATE, handlers);