import { 
  LOADING_CONVERSATION_LIST,
  CONVERSATION_LIST_FAIL,
  CONVERSATION_LIST_SUCCESS,
  LOADING_LOAD_MORE_CONVERSATIONS,
  LOAD_MORE_CONVERSATIONS_FAIL,
  LOAD_MORE_CONVERSATIONS_SUCCESS,
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
  UPDATE_TITLE_SUCCESS
} from '../constants';

export const getConversationList = (conversationListQuery) => {
  return dispatch => {
    dispatch({
      type: LOADING_CONVERSATION_LIST,
      payload: {}
    });
    return conversationListQuery.list((err, response) => {
      if (err) {
        dispatch({
          type: CONVERSATION_LIST_FAIL,
          payload: error
        });
        return;
      }
      dispatch({
        type: CONVERSATION_LIST_SUCCESS,
        payload: response
      }); 
    })
  };
};

export const loadMoreConversations = (conversationListQuery) => {
  return dispatch => {
    dispatch({
      type: LOADING_LOAD_MORE_CONVERSATIONS,
      payload: {}
    });
    return conversationListQuery.list((err, response) => {
      if (err) {
        dispatch({
          type: LOAD_MORE_CONVERSATIONS_FAIL,
          payload: err
        });
        return;
      }
      dispatch({
        type: LOAD_MORE_CONVERSATIONS_SUCCESS,
        payload: response
      });
    })
  };
};

export const updateTitle = (conversation, title) => {
  return dispatch => {
    dispatch({
      type: PROCESS_UPDATE_TITLE,
      payload: {}
    });
    return conversation.updateTitle(title, (err, response) => {
      if (err) {
        dispatch({
          type: UPDATE_TITLE_FAIL,
          payload: err
        });
        return;
      }
      dispatch({
        type: UPDATE_TITLE_SUCCESS,
        payload: {title: title}
      });
    })
  };
};

export const muteConversation = (conversation) => {
  return dispatch => {
    dispatch({
      type: PROCESS_MUTE_CONVERSATION,
      payload: {}
    });
    return conversation.muteConversation((err, response) => {
      if (err) {
        dispatch({
          type: MUTE_CONVERSATION_FAIL,
          payload: err
        });
        return;
      }
      dispatch({
        type: MUTE_CONVERSATION_SUCCESS,
        payload: response
      });
    })
  };
};

export const unmuteConversation = (conversation) => {
  return dispatch => {
    dispatch({
      type: PROCESS_UNMUTE_CONVERSATION,
      payload: {}
    });
    return conversation.unmuteConversation((err, response) => {
      if (err) {
        dispatch({
          type: UNMUTE_CONVERSATION_FAIL,
          payload: err
        });
        return;
      }
      dispatch({
        type: UNMUTE_CONVERSATION_SUCCESS,
        payload: response
      });
    })
  };
};

export const leaveConversation = (conversation) => {
  return dispatch => {
    dispatch({
      type: PROCESS_LEAVE_CONVERSATION,
      payload: {}
    });
    return conversation.leave((err, response) => {
      if (err) {
        dispatch({
          type: LEAVE_CONVERSATION_FAIL,
          payload: err
        });
        return;
      }
      dispatch({
        type: LEAVE_CONVERSATION_SUCCESS,
        payload: response
      });
    })
  };
};

export const deleteConversation = (conversation) => {
  return dispatch => {
    dispatch({
      type: PROCESS_DELETE_CONVERSATION,
      payload: {}
    });
    return conversation.delete((err, response) => {
      if (err) {
        dispatch({
          type: DELETE_CONVERSATION_FAIL,
          payload: err
        });
        return;
      }
      dispatch({
        type: DELETE_CONVERSATION_SUCCESS,
        payload: response
      });
    })
  };
};