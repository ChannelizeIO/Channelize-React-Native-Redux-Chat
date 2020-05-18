import { 
  LOADING_CONVERSATION_LIST,
  CONVERSATION_LIST_FAIL,
  CONVERSATION_LIST_SUCCESS,
  LOADING_LOAD_MORE_CONVERSATIONS,
  LOAD_MORE_CONVERSATIONS_FAIL,
  LOAD_MORE_CONVERSATIONS_SUCCESS
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