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

export const block = (client, userId) => {
  return dispatch => {
    dispatch({
      type: BLOCKING,
      payload: {}
    });
    return client.User.block(userId, (error, res) => {
      if (error) {
        dispatch({
          type: BLOCK_USER_FAIL,
          payload: error
        });
        return;
      }
      dispatch({
        type: BLOCK_USER_SUCCESS,
        payload: res
      });
    });
  }
};

export const unblock = (client, userId) => {
  return dispatch => {
    dispatch({
      type: UNBLOCKING,
      payload: {}
    });
    client.User.unblock(userId, (error, res) => {
      if (error) {
        dispatch({
          type: UNBLOCK_USER_FAIL,
          payload: error
        });
        return;
      }
      dispatch({
        type: UNBLOCK_USER_SUCCESS,
        payload: res
      });
    });
  }
};

export const getFriendsList = (userListQuery) => {
  return dispatch => {
    dispatch({
      type: LOADING_FRIEND_LIST,
      payload: {}
    });
    userListQuery.friendsList((error, res) => {
      if (error) {
        dispatch({
          type: FRIEND_LIST_FAIL,
          payload: error
        });
        return;
      }
      dispatch({
        type: FRIEND_LIST_SUCCESS,
        payload: res
      });
    });
  }
};

export const searchFriendList = (userListQuery) => {
  return dispatch => {
    dispatch({
      type: SEARCHING_FRIEND_LIST,
      payload: {}
    });
    userListQuery.friendsList((error, res) => {
      if (error) {
        dispatch({
          type: SEARCH_FRIEND_LIST_FAIL,
          payload: error
        });
        return;
      }
      dispatch({
        type: SEARCH_FRIEND_LIST_SUCCESS,
        payload: res
      });
    });
  }
};

export const loadMoreFriends = (userListQuery) => {
  return dispatch => {
    dispatch({
      type: LOADING_MORE_FRIENDS,
      payload: {}
    });
    return userListQuery.list((err, response) => {
      if (err) {
        dispatch({
          type: LOAD_MORE_FRIENDS_FAIL,
          payload: err
        });
        return;
      }
      dispatch({
        type: LOAD_MORE_FRIENDS_SUCCESS,
        payload: response
      });
    })
  };
};

export const loadOnlineFriends = (userListQuery) => {
  return dispatch => {
    dispatch({
      type: LOADING_ONLINE_FRIENDS,
      payload: {}
    });
    userListQuery.online = true;
    return userListQuery.list((err, response) => {
      if (err) {
        dispatch({
          type: ONLINE_FRIENDS_LIST_FAIL,
          payload: err
        });
        return;
      }
      dispatch({
        type: ONLINE_FRIENDS_LIST_SUCCESS,
        payload: response
      });
    })
  };
};
