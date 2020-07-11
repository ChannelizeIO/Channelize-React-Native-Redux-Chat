import {produce, setAutoFreeze} from "immer"
import CONFIG from '../config'

setAutoFreeze(false);

export function createReducer(initialState, actionsMap) {
  return (state = initialState, action) => {
    return produce(state, draft => {
      const caseReducer = actionsMap[action.type];
      return caseReducer ? caseReducer(draft, action) : undefined;
    });
  };
}

export function uniqueList(list) {
  return list.reduce((uniqList, currentValue) => {
    let ids = uniqList.map(item => {
      return item.id;
    });
    if (ids.indexOf(currentValue.id) < 0) {
      uniqList.push(currentValue);
    }
    return uniqList;
  }, []);
};

export const modifyMessageList = (client, conversation, list) => {
  const user = client.getCurrentUser();

  // Find last message of logged-in user
  let lastMessage;
  for (let i = 0; i < list.length; i++) {
    const message = list[i];
    if (user.id == message.ownerId) {
      lastMessage = message;
      break;
    }
  }

  return list.map((message, i) => {
    //return message;
    message._id = message.id;
    message.text = message.body;

    // Handle deleted message
    if (message.isDeleted) {
      message.text = 'This message was deleted'        
    }

    // Tick status
    message.readByAll = conversation.readByAllMembers(message);
    message.showPendingStatus = false;
    message.showReceivedStatus = false;
    message.showReadStatus = false;
    if (message.pending) {
      message.showPendingStatus = true;
    } else if (message.ownerId == user.id && !message.readByAll) {
      message.showReceivedStatus = true;
    } else if (lastMessage && lastMessage.id == message.id && message.readByAll) {
      message.showReadStatus = true;
    }

    // Handle created At
    if(!('createdAt' in message)) {
      message.createdAt = Date.now();
    }

    // Handle message owner
    if(message.owner) {
      message.owner._id = message.owner.id ||  message.owner._id;
      message.owner.name = message.owner.displayName || message.owner.name;
      message.owner.avatar = message.owner.profileImageUrl || message.owner.avatar;
      message.user = message.owner;
    } else {
      message.owner = {};
      message.owner._id = user.id;
      message.owner.name = user.displayName;
      message.owner.avatar = user.profileImageUrl;
      message.user = {
        _id: user.id,
        name: user.displayName,
        avatar: user.profileImageUrl
      };
    }

    const attachments = message.attachments;
    if (attachments && attachments.length) {
      const attachment = attachments[0];

      // Handle image message
      if (attachment.type == 'image') {
        if (attachment.thumbnailUrl) {
          message.image = attachment.thumbnailUrl  
        } else if (attachment.fileUrl) {
          message.image = attachment.fileUrl  
        } else {
          message.image = attachment.uri;
        }
      }

      // Handle gif & sticker message
      if (['gif', 'sticker'].indexOf(attachment.type) >= 0) {
        message.image = attachment.originalUrl;
      }

      // Handle location message
      if (attachment.type == 'location') {
        const imagePreviewUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${
          attachment.latitude
          },${
          attachment.longitude
          }&zoom=15&size=200x200&maptype=roadmap&markers=color:red%7Clabel:A%7C${
          attachment.latitude
          },${attachment.longitude}&key=${CONFIG.GOOGLE_MAP_API_KEY}`;
        message.image = imagePreviewUrl
        message.text = attachment.address;
      }

      // Handle video message
      if (attachment.type == 'video') {
        message.video = attachment.name;
        message.videoProps = {
         fileUrl: attachment.fileUrl,
         poster: attachment.thumbnailUrl,
         posterResizeMode: 'cover',
         resizeMode: 'cover',
         paused: true,
         controls:true
        };
      }

      // Handle audio message
      if (attachment.type == 'audio') {
        message.video = attachment.fileUrl;
      }

      // Handle admin message
      if (message.type == 'admin') {
        message.system = true;
        message = _modifyAdminMessage(user, message);
      }
    }
    return message;
  });
};

export const getLastMessageString = (client, conversation) => {
  const user = client.getCurrentUser();
  let lastMessage = conversation.lastMessage;

  let lastMessageString;
  if (!Object.keys(lastMessage).length) {
    lastMessageString = '';
    return lastMessageString;
  }

  // Handle admin message
  if (lastMessage.type == 'admin') {
    lastMessage = _modifyAdminMessage(user, lastMessage);
    lastMessageString = lastMessage.text;

    return lastMessageString
  }

  // Handle attachment
  const attachments = lastMessage.attachments;
  if (attachments.length) {
    const attachment = attachments[0];

    if (lastMessage.owner.id == user.id) {
      lastMessageString = `You sent a ${attachment.type}`
    } else {
      const displayName = capitalize(lastMessage.owner.displayName);
      lastMessageString = `${displayName} sent a ${attachment.type}`
    }

    return lastMessageString;
  }

  // Set messageOwnerName
  let messageOwnerName;
  if (lastMessage.owner.id == user.id) {
    messageOwnerName = 'You: '
  } else {
    if (conversation.isGroup) {
      const displayName = capitalize(lastMessage.owner.displayName);
      messageOwnerName = `${displayName}: `;
    }
  }

  if (lastMessage.isDeleted) {
    lastMessage.body = "This message was deleted."
  }

  if (!messageOwnerName) {
    lastMessageString = `${lastMessage.body}`
  } else {
    lastMessageString = `${messageOwnerName}${lastMessage.body}`
  }

  return lastMessageString;
}

export const typingString = (typing) => {
  if (!typing.length) {
    return null;
  }

  typing = typing.map(user => capitalize(user.displayName.split(' ')[0]));
  if (typing.length == 1) {
    return `${typing[0]} is typing...`;
  } else if(typing.length == 2) {
    const firstUser = typing[0];
    const secondUser = typing[1];
    return `${firstUser} and {secondUser} are typing...`;
  } else if(typing.length > 2) {
    const commaSeparatedUsers = typing.slice(0, -1).join(', ')
    const lastuser = typing.slice(-1);
    return `${commaSeparatedUsers} and {lastuser} are typing...`;
  }
} 

export function dateTimeParser(time) {
  const today = new Date();
  const todayDate = today.getDate();
  const todayMonth = today.getMonth();
  const todayYear = today.getYear();

  const inputDate = new Date(time);
  const inputTimeDate = inputDate.getDate();
  const inputTimeMonth = inputDate.getMonth();
  const inputTimeDateYear = inputDate.getYear();

  const showWeekDay = inputTimeDateYear == todayYear && inputTimeMonth == todayMonth && todayDate - inputTimeDate <= 7;
  const showTime = inputTimeDateYear == todayYear && inputTimeMonth == todayMonth && inputTimeDate == todayDate;
  if (showTime) {
    let hours = inputDate.getHours();
    var AmOrPm = hours >= 12 ? 'PM' : 'AM';
    hours = (hours % 12) || 12;
    var minutes = '0' + inputDate.getMinutes() ;
    return hours + ":" + minutes.substr(-2) + " " + AmOrPm;
  } else if (showWeekDay) {
    const weeks = [
     'Sun',
     'Mon',
     'Tue',
     'Wed',
     'Thu',
     'Fri',
     'Sat'
    ]
    return weeks[inputDate.getDay()];
  } else {
    return inputTimeMonth + '/' + inputTimeDate;
  }
}

export function sprintf() {
  let format = this.format;
  for( var i=0; i < arguments.length; i++ ) {
    format = format ? format.replace( /%s/, arguments[i]) : '';
  }
  return format;
}

export const capitalize = (s) => {
  if (!s) return
  s = s.split(" ");

  for (var i = 0, x = s.length; i < x; i++) {
      if (!s[i]) {
        s[i] = s[i];
      } else {
        s[i] = s[i][0].toUpperCase() + s[i].substr(1);
      }
  }

  return s.join(" ");
}

export const getAvatarTitleAndColor = (s) => {
  if (!s) return s = '';

  let avatarName;
  const name = s.toUpperCase().split(' ');
  if (name.length === 1) {
    avatarName = `${name[0].charAt(0)}`;
  } else if (name.length > 1) {
    avatarName = `${name[0].charAt(0)}${name[1].charAt(0)}`;
  } else {
    avatarName = '';
  }

  let sumChars = 0;
  for (let i = 0; i < s.length; i += 1) {
      sumChars += s.charCodeAt(i);
  }
  // inspired by https://github.com/wbinnssmith/react-user-avatar
  // colors from https://flatuicolors.com/
    //   carrot: '#e67e22',
    // emerald: '#2ecc71',
    // peterRiver: '#3498db',
    // wisteria: '#8e44ad',
    // alizarin: '#e74c3c',
    // turquoise: '#1abc9c',
    // midnightBlue: '#2c3e50',
  const colors = [
    '#e67e22',
    '#2ecc71',
    '#3498db',
    '#8e44ad',
    '#e74c3c',
    '#1abc9c',
    '#2c3e50',
  ];
  let avatarColor = colors[sumChars % colors.length];
  return {
    title: avatarName,
    color: avatarColor
  }
}

const _modifyAdminMessage = (user, message) => {
  if (message.type != 'admin') {
    return message;
  }

  const attachments = message.attachments;
  if (!attachments.length) {
    return message;
  }

  // Manipulate subject
  attachment = attachments[0];
  let metaData = attachment.metaData;
  if (metaData.subType == 'user') {
    if (user.id == metaData.subId) {
      subName = 'You';
    } else {
      if (metaData.subUser) {
        subName = capitalize(metaData.subUser.displayName);
      } else {
        subName = 'Deleted Member'
      }
    }
  }

  // Manipulate object
  let objNames;
  const objType = metaData.objType;
  const objValues = metaData.objValues;
  if (metaData.objType == 'user') {
    if (metaData.objUsers) {
      if (user.id == metaData.objUsers.id) {
        objNames = 'you'
      } else {
        objNames = capitalize(metaData.objUsers.displayName);
      }
    } else {
      objNames = "Deleted Member";
    }
  } else if(metaData.objType == 'users' && Array.isArray(objValues)) {
    let names = [];
    objValues.forEach(value => {
      const objUser = metaData.objUsers.find(objUser => objUser && objUser.id == value);
      let name;
      if (objUser) {
        name = capitalize(objUser.displayName);
      } else {
        name = 'Deleted Member'
      }
      names.push(name);
    });
    objNames = names.join(', ');
  } else if(metaData.objType == 'group') {
    if(typeof objValues == 'string') {
      objNames = capitalize(objValues);
    } else {
      objNames = objValues;
    }
  }

  const formats = {
    admin_group_create: "%s created group %s",
    admin_group_join: "%s joined",
    admin_group_add_members: "%s added %s",
    admin_group_remove_members: "%s removed %s",
    admin_group_leave: "%s left",
    admin_group_make_admin: "%s are now an admin",
    admin_group_change_title: "%s changed the title to %s",
    admin_group_change_photo: "%s changed group photo",
    admin_call_video_missed: "%s missed a video call from %s",
    admin_call_voice_missed: "%s missed a voice call from %s",
  }
  const format = formats[attachment.adminMessageType];
  if (format) {
    message.text = sprintf.apply({format: format}, [subName, objNames]);
  }

  return message
}