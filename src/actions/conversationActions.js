import { 
  LOADING_CONVERSATION_LIST,
  CONVERSATION_LIST_FAIL,
  CONVERSATION_LIST_SUCCESS,
  CREATING_CONVERSATION,
  CREATE_CONVERSATION_FAIL,
  CREATE_CONVERSATION_SUCCESS,
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
  UPDATE_TITLE_SUCCESS,
  UPDATING_PROFILE_PHOTO,
  UPDATE_PROFILE_PHOTO_FAIL,
  UPDATE_PROFILE_PHOTO_SUCCESS
} from '../constants';

import { uploadFile } from '../native';

export const createConversation = (client, body) => {
  return async dispatch => {
    dispatch({
      type: CREATING_CONVERSATION,
      payload: {}
    });
    try {
      if (body.profileImageUrl) {
        const fileData = await uploadFile(client, body.profileImageUrl, 'image');
        body.profileImageUrl = fileData['fileUrl'];
      }

      return client.Conversation.createConversation(body, (error, response) => {
        if (error) {
          dispatch({
            type: CREATE_CONVERSATION_FAIL,
            payload: error
          });
          return;
        }
        dispatch({
          type: CREATE_CONVERSATION_SUCCESS,
          payload: response
        }); 
      })
    } catch(err) {
      if (err) {
        dispatch({
          type: CREATE_CONVERSATION_FAIL,
          payload: err
        });
        return;
      }
    }
  };
};

export const getConversationList = (conversationListQuery) => {
  return dispatch => {
    dispatch({
      type: LOADING_CONVERSATION_LIST,
      payload: {}
    });
    return conversationListQuery.list((error, response) => {
      if (error) {
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

export const updateProfilePhoto = (client, conversation, file) => {
  return async dispatch => {
    dispatch({
      type: UPDATING_PROFILE_PHOTO,
      payload: {}
    });

    const fileData = await uploadFile(client, file, 'image');

    return conversation.updateProfilePhoto(fileData['fileUrl'], (err, response) => {
      if (err) {
        dispatch({
          type: UPDATE_PROFILE_PHOTO_FAIL,
          payload: err
        });
        return;
      }
      dispatch({
        type: UPDATE_PROFILE_PHOTO_SUCCESS,
        payload: {profileImageUrl: profileImageUrl}
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