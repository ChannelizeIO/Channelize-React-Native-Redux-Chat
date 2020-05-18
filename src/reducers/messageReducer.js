import { 
  LOADING_MESSAGE_LIST,
  MESSAGE_LIST_FAIL,
  MESSAGE_LIST_SUCCESS,
  SENDING_MESSAGE,
  SEND_MESSAGE_FAIL,
  SEND_MESSAGE_SUCCESS,
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
  MARK_AS_READ_EVENT
} from '../constants';
import { createReducer, uniqueList } from '../utils';
import { Channelize } from '../../channelize-websdk/dist/index';

const INITIAL_STATE = {
  list: [],
  loading: false,
  error: null,
  loadingMoreMessage: false,
  allMessageLoaded: false,

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
  // state.list = [...[action.payload], ...state.list];
  // state.list = uniqueList(state.list);
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
    state.conversation = new Channelize.core.Conversation.Model(conversation);
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
    state.conversation = new Channelize.core.Conversation.Model(jsonConversaton);
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
    state.conversation = new Channelize.core.Conversation.Model(jsonConversaton);
  }
}

export const userStatusUpdated = (state, action) => {
  const user = action.payload.user;
  if (state.conversation && !state.conversation.isGroup && state.conversation.user.id == user.id) {
    let jsonConversaton = state.conversation.toJSON();
    jsonConversaton.user.isOnline = user.isOnline;
    jsonConversaton.user.lastSeen = user.lastSeen;

    //Convert in conversation model
    state.conversation = new Channelize.core.Conversation.Model(jsonConversaton);
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
    state.conversation = new Channelize.core.Conversation.Model(jsonConversaton);
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
    state.conversation = new Channelize.core.Conversation.Model(jsonConversaton);
  }
}

export const handlers = {
  [LOADING_MESSAGE_LIST]: loadingMessageList,
  [MESSAGE_LIST_SUCCESS]: messageListSuccess,
  [MESSAGE_LIST_FAIL]: messageListFail,
  [SENDING_MESSAGE]: sendingMessage,
  [SEND_MESSAGE_SUCCESS]: sendMessageSuccess,
  [SEND_MESSAGE_FAIL]: sendMessageFail,
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
  [MARK_AS_READ_EVENT]: markAsRead
};

export default createReducer(INITIAL_STATE, handlers);