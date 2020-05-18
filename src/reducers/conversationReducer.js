import {
  LOADING_CONVERSATION_LIST,
  CONVERSATION_LIST_FAIL,
  CONVERSATION_LIST_SUCCESS,
  LOADING_LOAD_MORE_CONVERSATIONS,
  LOAD_MORE_CONVERSATIONS_FAIL,
  LOAD_MORE_CONVERSATIONS_SUCCESS,
  USER_STATUS_UPDATED_EVENT,
  NEW_MESSAGE_RECEIVED_EVENT,
  USER_JOINED_EVENT,
  MEMBERS_ADDED_EVENT,
  MEMBERS_REMOVED_EVENT,
  CONVERSATION_UPDATED_EVENT,
  USER_UPDATED_EVENT,
  MARK_AS_READ_EVENT,
  TOTAL_UNREAD_MESSAGE_COUNT_UPDATED_EVENT 
} from '../constants';
import { createReducer, uniqueList } from '../utils';

const INITIAL_STATE = {
  list: [],
  loading: false,
  loadingMoreConversations: false,
  allConversationsLoaded: false,
  error: null
};

export const loadingConversationList = (state, action) => {
  state.loading = true;
};

export const listConversationSuccess = (state, action) => {
  state.loading = false;
  state.list = action.payload;
};

export const listConversationFail = (state, action) => {
  state.loading = false;
  state.error = action.payload;
};

export const loadingLoadMoreConversations = (state, action) => {
  state.loadingMoreConversations = true;
};

export const loadMoreConversationsSuccess = (state, action) => {
  state.loadingMoreConversations = false;
  if (!action.payload.length) {
    state.allConversationsLoaded = true;
  } else {
    state.list = [...state.list, ...action.payload];
    state.list = uniqueList(state.list);
  }
};

export const loadMoreConversationsFail = (state, action) => {
  state.loadingMoreConversations = false;
  state.error = action.payload;
};

export const userStatusUpdated = (state, action) => {
  let user = action.payload.user;
  const finalList = state.list.map((conversation, index) => {
    if (!conversation.isGroup && conversation.user.id == user.id) {
      conversation.user.isOnline = user.isOnline;
      conversation.user.lastSeen = user.lastSeen;

      return conversation;
    } else {
      return conversation;
    }
  })

  state.list = finalList;
};

export const userUpdated = (state, action) => {
  let user = action.payload.user;
  const finalList = state.list.map((conversation, index) => {
    if (!conversation.isGroup && conversation.user.id == user.id) {
      conversation.user.isOnline = user.isOnline;
      conversation.user.lastSeen = user.lastSeen;
      conversation.user.displayName = user.displayName;
      conversation.user.profileImageUrl = user.profileImageUrl;

      return conversation;
    } else {
      return conversation;
    }
  })

  state.list = finalList;
};

export const newMessageReceived = (state, action) => {
  let message = action.payload.message;
  let user = action.payload.user;

  let conversationIndex;
  let latestConversation;

  const finalList = state.list.map((conversation, index) => {
    if (conversation.id == message.conversationId) {
      conversation.lastMessage = message;
      conversation.updatedAt = action.payload.timestamp;

      if (user.id != message.ownerId) {
        conversation.unreadMessageCount = conversation.unreadMessageCount + 1;
      }

      conversationIndex = index;
      latestConversation = conversation;

      return conversation;
    } else {
      return conversation;
    }
  })

  // Move up the latest conversation
  if (conversationIndex > 0) {
    finalList.splice(conversationIndex, 1);
    finalList.unshift(latestConversation);
  }

  state.list = finalList;
};

export const conversationUpdated = (state, action) => {
  let conversation = action.payload.conversation;

  let conversationIndex;
  let latestConversation;

  const finalList = state.list.map((item, index) => {
    if (item.id == conversation.id) {
      item.title = conversation.title;
      item.profileImageUrl = conversation.profileImageUrl;
      item.updatedAt = action.payload.timestamp;

      conversationIndex = index;
      latestConversation = item;

      return item;
    } else {
      return item;
    }
  })

  // Move up the latest conversation
  if (conversationIndex > 0) {
    finalList.splice(conversationIndex, 1);
    finalList.unshift(latestConversation);
  }

  state.list = finalList;
};

export const userJoined = (state, action) => {
  const { conversation } = action.payload;
  state.list = [...[conversation], ...state.list];
  state.list = uniqueList(state.list);
};

export const membersAdded = (state, action) => {
  let { conversation, members, timestamp } = action.payload;

  let conversationIndex;
  let latestConversation;

  const finalList = state.list.map((item, index) => {
    if (item.id == conversation.id) {
      item.memberCount = conversation.memberCount;
      item.updatedAt = timestamp;
      item.members = item.members.concat(members)

      conversationIndex = index;
      latestConversation = item;

      return item;
    } else {
      return item;
    }
  })

  // Move up the latest conversation
  if (conversationIndex > 0) {
    finalList.splice(conversationIndex, 1);
    finalList.unshift(latestConversation);
  }

  state.list = finalList;
};

export const membersRemoved = (state, action) => {
  let { conversation, members, timestamp } = action.payload;

  let conversationIndex;
  let latestConversation;

  const finalList = state.list.map((item, index) => {
    if (item.id == conversation.id) {
      item.memberCount = conversation.memberCount;
      item.updatedAt = timestamp;

      // Remove members
      members.forEach(removedMember => {
        const index = item.members.findIndex(member => member.userId == removedMember.id)
        if (index >=0) {
          item.members.splice(index, 1);
        }
      })

      conversationIndex = index;
      latestConversation = item;

      return item;
    } else {
      return item;
    }
  })

  // Move up the latest conversation
  if (conversationIndex > 0) {
    finalList.splice(conversationIndex, 1);
    finalList.unshift(latestConversation);
  }

  state.list = finalList;
};

export const markAsRead = (state, action) => {
  let { conversation, user, timestamp } = action.payload;

  const finalList = state.list.map((item, index) => {
    if (item.id == conversation.id) {
      if (item.lastReadAt[user.id]) {
        item.lastReadAt[user.id] = timestamp;
      }

      return item;
    } else {
      return item;
    }
  })

  state.list = finalList;
}

export const totalUnreadMessageCountUpdatedEvent = (state, action) => {
  let { conversation, user, timestamp } = action.payload;

  const finalList = state.list.map((item, index) => {
    if (item.id == conversation.id) {
      item.unreadMessageCount = conversation.unreadMessageCount;

      return item;
    } else {
      return item;
    }
  })

  state.list = finalList;
}

export const handlers = {
  [LOADING_CONVERSATION_LIST]: loadingConversationList,
  [CONVERSATION_LIST_FAIL]: listConversationFail,
  [CONVERSATION_LIST_SUCCESS]: listConversationSuccess,
  [LOADING_LOAD_MORE_CONVERSATIONS]: loadingLoadMoreConversations,
  [LOAD_MORE_CONVERSATIONS_FAIL]: loadMoreConversationsFail,
  [LOAD_MORE_CONVERSATIONS_SUCCESS]: loadMoreConversationsSuccess,
  [USER_STATUS_UPDATED_EVENT]: userStatusUpdated,
  [NEW_MESSAGE_RECEIVED_EVENT]: newMessageReceived,
  [USER_JOINED_EVENT]: userJoined,
  [MEMBERS_ADDED_EVENT]: membersAdded,
  [MEMBERS_REMOVED_EVENT]: membersRemoved,
  [CONVERSATION_UPDATED_EVENT]: conversationUpdated,
  [USER_UPDATED_EVENT]: userUpdated,
  [MARK_AS_READ_EVENT]: markAsRead,
  [TOTAL_UNREAD_MESSAGE_COUNT_UPDATED_EVENT]: totalUnreadMessageCountUpdatedEvent
};

export default createReducer(INITIAL_STATE, handlers);