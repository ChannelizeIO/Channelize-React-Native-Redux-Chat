import { combineReducers } from 'redux';
import messageReducer from './messageReducer';
import clientReducer from './clientReducer';
import conversationReducer from './conversationReducer';
import memberReducer from './memberReducer';
import userReducer from './userReducer';

export default combineReducers({
  message: messageReducer,
  conversation: conversationReducer,
  client: clientReducer,
  member: memberReducer,
  user: userReducer
});
