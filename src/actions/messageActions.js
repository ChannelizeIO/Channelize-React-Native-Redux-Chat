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
  SET_ACTIVE_USERID
} from '../constants';
import { uploadFile } from '../native';

export const sendFileToConversation = (client, conversation, file, body, attachmentType) => {
  return async dispatch => {
    dispatch({
      type: SENDING_FILE,
      payload: body
    });
    try {
      const fileData = await uploadFile(client, file, attachmentType);
      body = {
        id: body.id,
        attachments: [fileData]
      }
      return conversation.sendMessage(body, (err, response) => {
        if (err) {
          body.error = err;
          dispatch({
            type: SEND_FILE_FAIL,
            payload: body
          });
          return;
        }
        dispatch({
          type: SEND_FILE_SUCCESS,
          payload: response
        });
        return
      });
    } catch(err) {
      if (err) {
        body.error = err;
        dispatch({
          type: SEND_FILE_FAIL,
          payload: body
        });
        return;
      }
    }
  }
};

export const sendMessageToConversation = (conversation, body) => {
  return dispatch => {
    dispatch({
      type: SENDING_MESSAGE,
      payload: body
    });
    body = {
      id: body.id,
      body: body.body,
      attachments: body.attachments ? body.attachments : [], 
    }
    return conversation.sendMessage(body, (err, response) => {
      if (err) {
        body.error = err;
        dispatch({
          type: SEND_MESSAGE_FAIL,
          payload: body
        });
        return;
      }
      dispatch({
        type: SEND_MESSAGE_SUCCESS,
        payload: response
      });
    })
  };
};

export const sendMessageToUserId = (client, userId, body) => {
  return dispatch => {
    dispatch({
      type: SENDING_MESSAGE,
      payload: body
    });
    return client.Message.sendMessage(body, (error, response) => {
      if (error) {
        dispatch({
          type: SEND_MESSAGE_FAIL,
          payload: error
        });
        return;
      }
      dispatch({
        type: SEND_MESSAGE_SUCCESS,
        payload: response
      });
    })
  };
};

export const getMessageList = (messageListQuery) => {
  return dispatch => {
    dispatch({
      type: LOADING_MESSAGE_LIST,
      payload: {}
    });
    return messageListQuery.list((error, response) => {
      if (error) {
        dispatch({
          type: MESSAGE_LIST_FAIL,
          payload: error
        });
        return;
      }

      let payload = {list: response}
      payload.allMessageLoaded = false;
      if (response.length < messageListQuery.limit) {
        payload.allMessageLoaded = true;
      }
      dispatch({
        type: MESSAGE_LIST_SUCCESS,
        payload: payload
      });
    })
  };
};

export const loadMoreMessages = (messageListQuery) => {
  return dispatch => {
    dispatch({
      type: LOADING_LOAD_MORE_MESSAGES,
      payload: {}
    });
    return messageListQuery.list((error, response) => {
      if (error) {
        dispatch({
          type: LOAD_MORE_MESSAGES_FAIL,
          payload: error
        });
        return;
      }
      dispatch({
        type: LOAD_MORE_MESSAGES_SUCCESS,
        payload: response
      });
    })
  };
};

export const setActiveConversation = (conversation) => {
  return dispatch => {
    dispatch({
      type: SET_ACTIVE_CONVERSATION,
      payload: conversation
    });
  };
};

export const setActiveUserId = (userId) => {
  return dispatch => {
    dispatch({
      type: SET_ACTIVE_USERID,
      payload: userId
    });
  };
};
