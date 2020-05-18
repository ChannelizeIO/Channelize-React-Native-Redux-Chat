import {
  CONNECTING, 
  CONNECT_SUCCESS,
  CONNECT_FAIL,
  DISCONNECT_SUCCESS,
  DISCONNECT_FAIL
} from '../constants';

const INITIAL_STATE = {
  connected: false,
  connecting: false,
  error: null
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case CONNECTING:
      return { ...state, connecting: true };
    case CONNECT_SUCCESS:
  	  return { ...state, connected: true, connecting: false };
  	case CONNECT_FAIL:
  	  return { ...state, connected: false, connecting: false, error: action.payload };
  	case DISCONNECT_SUCCESS:
  	  return { ...state, connected: false };
  	case DISCONNECT_FAIL:
  	  return { ...state, connected: true, error: action.payload };
  	default:
      return state;
  }
};
