import {
  LOADING_MEMBERS,
  LIST_MEMBERS_FAIL,
  LIST_MEMBERS_SUCCESS,
  ADDING_MEMBERS,
  ADD_MEMBERS_FAIL,
  ADD_MEMBERS_SUCCESS,
  REMOVING_MEMBERS,
  REMOVE_MEMBERS_FAIL,
  REMOVE_MEMBERS_SUCCESS,
  ADDING_ADMIN,
  ADD_ADMIN_FAIL,
  ADD_ADMIN_SUCCESS,
  REMOVING_ADMIN,
  REMOVE_ADMIN_FAIL,
  REMOVE_ADMIN_SUCCESS
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

export const removeMembers = (conversation, memberIds) => {
  return dispatch => {
    dispatch({
      type: REMOVING_MEMBERS,
      payload: {}
    });
    return conversation.removeMembers(memberIds, (err, response) => {
      if (err) {
        dispatch({
          type: REMOVE_MEMBERS_FAIL,
          payload: err
        });
        return;
      }
      dispatch({
        type: REMOVE_MEMBERS_SUCCESS,
        payload: response
      });
    })
  };
};

export const addAdmin = (conversation, userId) => {
  return dispatch => {
    dispatch({
      type: ADDING_ADMIN,
      payload: {}
    });
    return conversation.addAdmin(userId, (err, response) => {
      if (err) {
        dispatch({
          type: ADD_ADMIN_FAIL,
          payload: err
        });
        return;
      }
      dispatch({
        type: ADD_ADMIN_SUCCESS,
        payload: response
      });
    })
  };
};

export const removeAdmin = (conversation, userId) => {
  return dispatch => {
    dispatch({
      type: REMOVING_ADMIN,
      payload: {}
    });
    return conversation.removeAdmin(userId, (err, response) => {
      if (err) {
        dispatch({
          type: REMOVE_ADMIN_FAIL,
          payload: err
        });
        return;
      }
      dispatch({
        type: REMOVE_ADMIN_SUCCESS,
        payload: response
      });
    })
  };
};