import {
  BLOCKING,
  BLOCK_USER_FAIL,
  BLOCK_USER_SUCCESS,
  UNBLOCKING,
  UNBLOCK_USER_FAIL,
  UNBLOCK_USER_SUCCESS,
  LOADING_FRIEND_LIST,
  FRIEND_LIST_SUCCESS,
  FRIEND_LIST_FAIL,
  LOADING_MORE_FRIENDS,
  LOAD_MORE_FRIENDS_FAIL,
  LOAD_MORE_FRIENDS_SUCCESS,
  LOADING_ONLINE_FRIENDS,
  ONLINE_FRIENDS_LIST_FAIL,
  ONLINE_FRIENDS_LIST_SUCCESS,
  SEARCHING_FRIEND_LIST,
  SEARCH_FRIEND_LIST_FAIL,
  SEARCH_FRIEND_LIST_SUCCESS
} from '../constants';

import { createReducer, uniqueList } from '../utils';

const INITIAL_STATE = {
  error: null,
  loading: false,
  loadingMoreFriends: false,
  friendList: [],
  allFriendsLoaded: false,

  loadingOnlineFriends: false,
  onlineFriendList: [],

  searching: false,
  searchedFriendList: [],

  // When any action is in process
  actionInProcess: false
};

export const blocking = (state, action) => {
  state.actionInProcess = true;
};

export const blockUserFail = (state, action) => {
  state.actionInProcess = false;
  state.error = error;
};

export const blockUserSuccess = (state, action) => {
  state.actionInProcess = false;
};

export const unblocking = (state, action) => {
  state.actionInProcess = true;
};

export const unblockUserFail = (state, action) => {
  state.actionInProcess = false;
  state.error = error;
};

export const unblockUserSuccess = (state, action) => {
  state.actionInProcess = false;
};

export const loadingFriendList = (state, action) => {
  state.loading = true;
};

export const listFriendSuccess = (state, action) => {
  state.loading = false;
  state.friendList = action.payload;
};

export const listFriendFail = (state, action) => {
  state.loading = false;
  state.error = action.payload;
};

export const searchingFriendList = (state, action) => {
  state.searching = true;
  state.searchedFriendList = [];
};

export const searchFriendListSuccess = (state, action) => {
  state.searching = false;
  state.searchedFriendList = action.payload;
};

export const searchFriendListFail = (state, action) => {
  state.searching = false;
  state.error = action.payload;
};

export const loadingMoreFriends = (state, action) => {
  state.loadingMoreFriends = true;
};

export const loadMoreFriendsSuccess = (state, action) => {
  state.loadingMoreFriends = false;
  if (!action.payload.length) {
    state.allFriendsLoaded = true;
  } else {
    state.friendList = [...state.friendList, ...action.payload];
    state.friendList = uniqueList(state.friendList);
  }
};

export const loadMoreFriendsFail = (state, action) => {
  state.loadingMoreFriends = false;
  state.error = action.payload;
};

export const loadingOnlineFriends = (state, action) => {
  state.loadingOnlineFriends = true;
};

export const listOnlineFriendsSuccess = (state, action) => {
  state.loadingOnlineFriends = false;
  state.onlineFriendList = action.payload;
};

export const listOnlineFriendsFail = (state, action) => {
  state.loadingOnlineFriends = false;
  state.error = action.payload;
};

export const handlers = {
  [BLOCKING]: blocking,
  [BLOCK_USER_FAIL]: blockUserFail,
  [BLOCK_USER_SUCCESS]: blockUserSuccess,
  [UNBLOCKING]: unblocking,
  [UNBLOCK_USER_FAIL]: unblockUserFail,
  [UNBLOCK_USER_SUCCESS]: unblockUserSuccess,
  [LOADING_FRIEND_LIST]: loadingFriendList,
  [FRIEND_LIST_FAIL]: listFriendFail,
  [FRIEND_LIST_SUCCESS]: listFriendSuccess,
  [LOADING_MORE_FRIENDS]: loadingMoreFriends,
  [LOAD_MORE_FRIENDS_FAIL]: loadMoreFriendsFail,
  [LOAD_MORE_FRIENDS_SUCCESS]: loadMoreFriendsSuccess,
  [LOADING_ONLINE_FRIENDS]: loadingOnlineFriends,
  [ONLINE_FRIENDS_LIST_FAIL]: listOnlineFriendsFail,
  [ONLINE_FRIENDS_LIST_SUCCESS]: listOnlineFriendsSuccess,
  [SEARCHING_FRIEND_LIST]: searchingFriendList,
  [SEARCH_FRIEND_LIST_FAIL]: searchFriendListFail,
  [SEARCH_FRIEND_LIST_SUCCESS]: searchFriendListSuccess,
}

export default createReducer(INITIAL_STATE, handlers);
