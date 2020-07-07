import {
  CONNECTING, 
  CONNECT_SUCCESS,
  CONNECT_FAIL,
  DISCONNECT_SUCCESS,
  DISCONNECT_FAIL,
  TYPING_EVENT,
  NEW_MESSAGE_RECEIVED_EVENT,
  USER_STATUS_UPDATED_EVENT,
  MARK_AS_READ_EVENT,
  USER_BLOCKED_EVENT,
  USER_UNBLOCKED_EVENT,
  USER_JOINED_EVENT,
  MEMBERS_ADDED_EVENT,
  MEMBERS_REMOVED_EVENT,
  CONVERSATION_UPDATED_EVENT,
  USER_UPDATED_EVENT,
  USER_REMOVED_EVENT,
  USER_MUTE_UPDATED_EVENT,
  USER_CONVERSATION_DELETED_EVENT,
  TOTAL_UNREAD_MESSAGE_COUNT_UPDATED_EVENT
} from '../constants';

const _connect = (client, userId, accessToken) => {
  return new Promise((resolve, reject) => {
    if (!userId) {
      reject('UserID is required.');
      return;
    }
    if (!accessToken) {
      reject('accessToken is required.');
      return;
    }

    if (!client) {
      reject('Channelize.io client was not created.');
    }

    client.connect(userId, accessToken, (error, res) => {
      if (error) {
        reject('Channelize.io connection Failed.');
      } else {
        resolve(res);
      }
    });
  });
};

export const setConnected = (value = true) => {
  return dispatch => {
    dispatch({
      type: CONNECT_SUCCESS,
      payload: {}
    });
  }
}

export const chConnect = (client, userId, accessToken) => {
  return dispatch => {
    dispatch({
      type: CONNECTING,
      payload: {}
    });

    return _connect(client, userId, accessToken)
      .then(response => connectSuccess(dispatch, response))
      .catch(error => connectFail(dispatch, error));
  };
};

const connectSuccess = (dispatch, response) => {
  dispatch({
    type: CONNECT_SUCCESS,
    payload: response
  });
};

const connectFail = (dispatch, error) => {
  dispatch({
    type: CONNECT_FAIL,
    payload: error
  });
};

const _disconnect = (client) => {
  return new Promise((resolve, reject) => {
    if (client) {
      client.disconnect(() => {
        resolve(null);
      });
    } else {
      resolve(null);
    }
  });
};

export const chDisconnect = (client) => {
  return dispatch => {
    return _disconnect(client)
      .then(response => disconnectSuccess(dispatch, response))
      .catch(error => disconnectFail(dispatch, error));
  };
};

const disconnectSuccess = (dispatch, response) => {
  dispatch({
    type: DISCONNECT_SUCCESS,
    payload: response
  });
};

const disconnectFail = (dispatch, error) => {
  dispatch({
    type: DISCONNECT_FAIL,
    payload: error
  });
};

export const registerEventHandlers = (client) => {
  return dispatch => {
    client.chsocket.on('user.status_updated', function (payload) {
      dispatch({
        type: USER_STATUS_UPDATED_EVENT,
        payload: payload
      });
    });

    client.chsocket.on('user.updated', function (payload) {
      dispatch({
        type: USER_UPDATED_EVENT,
        payload: payload
      });
    });

    client.chsocket.on('user.message_created', function (response) {
      const user = client.getCurrentUser();
      response.user = user;
      dispatch({
        type: NEW_MESSAGE_RECEIVED_EVENT,
        payload: response
      });
    });

    client.chsocket.on('user.joined', function (response) {
      // Load conversation will all attributes from server
      const { conversation } = response;
      client.Conversation.getConversation(conversation.id, null, (err, conversation) => {
        if (err) {
          return;
        }

        response.conversation = conversation;

        dispatch({
          type: USER_JOINED_EVENT,
          payload: response
        });
      })
    });

    client.chsocket.on('user.removed', function (response) {
      dispatch({
        type: USER_REMOVED_EVENT,
        payload: response
      });
    });

    client.chsocket.on('user.conversation_deleted', function (response) {
      dispatch({
        type: USER_CONVERSATION_DELETED_EVENT,
        payload: response
      });
    });

    client.chsocket.on('user.mute_updated', function (res) {
      dispatch({
        type: USER_MUTE_UPDATED_EVENT,
        payload: res
      });
    });

    client.chsocket.on('conversation.members_added', function (response) {
      dispatch({
        type: MEMBERS_ADDED_EVENT,
        payload: response
      });
    });

    client.chsocket.on('conversation.members_removed', function (response) {
      dispatch({
        type: MEMBERS_REMOVED_EVENT,
        payload: response
      });
    });

    client.chsocket.on('conversation.updated', function (response) {
      dispatch({
        type: CONVERSATION_UPDATED_EVENT,
        payload: response
      });
    });

    client.chsocket.on('conversation.mark_as_read', function (response) {
      dispatch({
        type: MARK_AS_READ_EVENT,
        payload: response
      });
    });

    client.chsocket.on('user.total_unread_message_count_updated', function (response) {
      dispatch({
        type: TOTAL_UNREAD_MESSAGE_COUNT_UPDATED_EVENT,
        payload: response
      });
    });

    client.chsocket.on('conversation.typing', function (response) {
      console.log("response", response)
      dispatch({
        type: TYPING_EVENT,
        payload: response
      });
    });

    client.chsocket.on('user.blocked', function (response) {
      dispatch({
        type: USER_BLOCKED_EVENT,
        payload: response
      });
    });

    client.chsocket.on('user.unblocked', function (response) {
      dispatch({
        type: USER_UNBLOCKED_EVENT,
        payload: response
      });
    });
  };
};