import { 
  LOADING_MESSAGE_LIST,
  MESSAGE_LIST_FAIL,
  MESSAGE_LIST_SUCCESS,
  SENDING_MESSAGE,
  SEND_MESSAGE_FAIL,
  SEND_MESSAGE_SUCCESS,
  SENDING_FILE,
  SEND_FILE_FAIL,
  SEND_FILE_SUCCESS,
  LOADING_LOAD_MORE_MESSAGES,
  LOAD_MORE_MESSAGES_SUCCESS,
  LOAD_MORE_MESSAGES_FAIL,
  SET_ACTIVE_CONVERSATION,
  SET_ACTIVE_USERID,
  CONVERSATION_UPDATED_EVENT,
  MEMBERS_ADDED_EVENT,
  MEMBERS_REMOVED_EVENT,
  NEW_MESSAGE_RECEIVED_EVENT,
  USER_STATUS_UPDATED_EVENT,
  USER_UPDATED_EVENT,
  MARK_AS_READ_EVENT,
  USER_BLOCKED_EVENT,
  USER_UNBLOCKED_EVENT,
  TYPING_EVENT,
  USER_REMOVED_EVENT,
  USER_CONVERSATION_DELETED_EVENT,
  ADMIN_ADDED_EVENT,
  ADMIN_REMOVED_EVENT
} from '../constants';
import { createReducer, uniqueList } from '../utils';
import { Channelize } from 'channelize-chat';

const INITIAL_STATE = {
  list: [],
  loading: false,
  error: null,
  loadingMoreMessage: false,
  allMessageLoaded: false,

  //typing event
  typing: [],

  // typing
  // Sending file
  sendingFile: false,

  // Active conversation and userId
  conversation: null,
  userId: null,

  newMessage: null
};

export const loadingMessageList = (state, action) => {
  state.loading = true;
  state.allMessageLoaded = false;
};

export const messageListSuccess = (state, action) => {
  state.loading = false;
  state.list = action.payload.list;
  state.allMessageLoaded = action.payload.allMessageLoaded;
};

export const messageListFail = (state, action) => {
  state.loading = false;
  state.error = action.payload;
};

export const loadingLoadMoreMessages = (state, action) => {
  state.loadingMoreMessage = true;
};

export const loadMoreMessagesFail = (state, action) => {
  state.loadingMoreMessage = false;
  state.error = action.payload;
};

export const loadMoreMessagesSuccess = (state, action) => {
  state.loadingMoreMessage = false;
  if (!action.payload.length) {
    state.allMessageLoaded = true;
  } else {
    state.list = [...state.list, ...action.payload];
    state.list = uniqueList(state.list);
  }
};

export const sendingMessage = (state, action) => {
  state.sendingMessage = true;
  state.list = [...[action.payload], ...state.list];
  state.list = uniqueList(state.list);
};

export const sendMessageSuccess = (state, action) => {
  state.sendingMessage = false;
  state.list = [...[action.payload], ...state.list];
  state.list = uniqueList(state.list);
};

export const sendMessageFail = (state, action) => {
  state.sendingMessage = false;
  state.error = action.payload;
};

export const sendingFile = (state, action) => {
  state.sendingFile = true;
  state.list = [...[action.payload], ...state.list];
  state.list = uniqueList(state.list);
};

export const sendFileSuccess = (state, action) => {
  state.sendingFile = false;
  state.list = [...[action.payload], ...state.list];
  state.list = uniqueList(state.list);
};

export const sendFileFail = (state, action) => {
  state.sendingFile = false;
  state.list = [...[action.payload], ...state.list];
  state.list = uniqueList(state.list);
};

export const setActiveConversation = (state, action) => {
  state.conversation = action.payload;
  state.userId = null;
  state.list = [];
};

export const setActiveUserId = (state, action) => {
  state.userId = action.payload;
  state.conversation = null;
  state.list = [];
};

export const newMessageReceived = (state, action) => {
  let message = action.payload.message;
  if (state.conversation && state.conversation.id == message.conversationId) {
    state.list = [...[message], ...state.list];
    state.list = uniqueList(state.list);

    state.newMessage = message;
  }
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
  if (state.conversation && state.conversation.id == conversation.id) {
    let jsonConversaton = state.conversation.toJSON();
    jsonConversaton.members = jsonConversaton.members.concat(members)
    jsonConversaton.memberCount = conversation.memberCount;
    jsonConversaton.updatedAt = timestamp;

    //Convert in conversation model
    const client = Channelize.client.getInstance();
    state.conversation = new Channelize.core.Conversation.Model(client, jsonConversaton);
  }
}

export const membersRemoved = (state, action) => {
  let { conversation, members, timestamp } = action.payload;
  if (state.conversation && state.conversation.id == conversation.id) {
    let jsonConversaton = state.conversation.toJSON();
    jsonConversaton.memberCount = conversation.memberCount;
    jsonConversaton.updatedAt = timestamp;

    // Remove members
    members.forEach(removedMember => {
      const index = jsonConversaton.members.findIndex(member => member.userId == removedMember.id)
      if (index >=0) {
        jsonConversaton.members.splice(index, 1);
      }
    })

    //Convert in conversation model
    const client = Channelize.client.getInstance();
    state.conversation = new Channelize.core.Conversation.Model(client, jsonConversaton);
  }
}

export const userRemoved = (state, action) => {
  let { conversation } = action.payload;

  const activeConversation = state.conversation;
  if (!activeConversation || activeConversation.id != conversation.id) {
    return
  }

  const client = Channelize.client.getInstance();

  let jsonConversation = activeConversation.toJSON();
  jsonConversation.isActive = false;

  state.conversation = new Channelize.core.Conversation.Model(client, jsonConversation);
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

export const userStatusUpdated = (state, action) => {
  const user = action.payload.user;
  if (state.conversation && !state.conversation.isGroup && state.conversation.user.id == user.id) {
    let jsonConversaton = state.conversation.toJSON();
    jsonConversaton.user.isOnline = user.isOnline;
    jsonConversaton.user.lastSeen = user.lastSeen;

    //Convert in conversation model
    const client = Channelize.client.getInstance();
    state.conversation = new Channelize.core.Conversation.Model(client, jsonConversaton);
  }
};

export const userUpdated = (state, action) => {
  const user = action.payload.user;
  if (state.conversation && !state.conversation.isGroup && state.conversation.user.id == user.id) {
    let jsonConversaton = state.conversation.toJSON();
    jsonConversaton.user.isOnline = user.isOnline;
    jsonConversaton.user.lastSeen = user.lastSeen;
    jsonConversaton.user.displayName = user.displayName;
    jsonConversaton.user.profileImageUrl = user.profileImageUrl;

    //Convert in conversation model
    const client = Channelize.client.getInstance();
    state.conversation = new Channelize.core.Conversation.Model(client, jsonConversaton);
  }
};

export const markAsRead = (state, action) => {
  let { conversation, user, timestamp } = action.payload;

  if (state.conversation && state.conversation.id == conversation.id) {
    let jsonConversaton = state.conversation.toJSON();
    if (jsonConversaton.lastReadAt[user.id]) {
      jsonConversaton.lastReadAt[user.id] = timestamp;
    }

    //Convert in conversation model
    const client = Channelize.client.getInstance();
    state.conversation = new Channelize.core.Conversation.Model(client, jsonConversaton);
  }
}

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

export const typingEvent = (state, action) => {
  const { conversation, isTyping, user } = action.payload;
  const activeConversation = state.conversation;
  if (!activeConversation || activeConversation.id != conversation.id) {
    return
  }

  const index = state.typing.findIndex(item => item.id == user.id);
  // If isTyping true, push user in  typing array
  if (isTyping && index < 0) {
    state.typing.push(user);
    return
  }

  // If isTyping false, remove user from typing array
  if (!isTyping && index >= 0) {
    state.typing.splice(index, 1);
  }
};

export const handlers = {
  [LOADING_MESSAGE_LIST]: loadingMessageList,
  [MESSAGE_LIST_SUCCESS]: messageListSuccess,
  [MESSAGE_LIST_FAIL]: messageListFail,
  [SENDING_MESSAGE]: sendingMessage,
  [SEND_MESSAGE_SUCCESS]: sendMessageSuccess,
  [SEND_MESSAGE_FAIL]: sendMessageFail,
  [SENDING_FILE]: sendingFile,
  [SEND_FILE_FAIL]: sendFileFail,
  [SEND_FILE_SUCCESS]: sendFileSuccess,
  [LOADING_LOAD_MORE_MESSAGES]: loadingLoadMoreMessages,
  [LOAD_MORE_MESSAGES_SUCCESS]: loadMoreMessagesSuccess,
  [LOAD_MORE_MESSAGES_FAIL]: loadMoreMessagesFail,
  [SET_ACTIVE_CONVERSATION]: setActiveConversation,
  [SET_ACTIVE_USERID]: setActiveUserId,
  [CONVERSATION_UPDATED_EVENT]: conversationUpdated,
  [MEMBERS_ADDED_EVENT]: membersAdded,
  [MEMBERS_REMOVED_EVENT]: membersRemoved,
  [NEW_MESSAGE_RECEIVED_EVENT]: newMessageReceived,
  [USER_STATUS_UPDATED_EVENT]: userStatusUpdated,
  [USER_UPDATED_EVENT]: userUpdated,
  [MARK_AS_READ_EVENT]: markAsRead,
  [USER_BLOCKED_EVENT]: userBlocked,
  [USER_UNBLOCKED_EVENT]: userUnblocked,
  [USER_REMOVED_EVENT]: userRemoved,
  [USER_CONVERSATION_DELETED_EVENT]: conversationDeleted,
  [TYPING_EVENT]: typingEvent,
  [ADMIN_ADDED_EVENT]: adminAdded,
  [ADMIN_REMOVED_EVENT]: adminRemoved,
};

export default createReducer(INITIAL_STATE, handlers);