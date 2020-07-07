import {
  LOADING_MEMBERS,
  LIST_MEMBERS_FAIL,
  LIST_MEMBERS_SUCCESS,
  ADDING_MEMBERS,
  ADD_MEMBERS_FAIL,
  ADD_MEMBERS_SUCCESS
} from '../constants';

export const getMembers = (conversation) => {
  return dispatch => {
    dispatch({
      type: LOADING_MEMBERS,
      payload: {}
    });
    return conversation.getMembers((err, members) => {
      if (err) {
        dispatch({
          type: LIST_MEMBERS_FAIL,
          payload: err
        });
        return;
      }
      dispatch({
        type: LIST_MEMBERS_SUCCESS,
        payload: members
      });
    })
  };
};

export const addMembers = (conversation, memberIds) => {
  return dispatch => {
    dispatch({
      type: ADDING_MEMBERS,
      payload: {}
    });
    return conversation.addMembers(memberIds, (err, response) => {
      if (err) {
        dispatch({
          type: ADD_MEMBERS_FAIL,
          payload: err
        });
        return;
      }
      dispatch({
        type: ADD_MEMBERS_SUCCESS,
        payload: response
      });
    })
  };
};