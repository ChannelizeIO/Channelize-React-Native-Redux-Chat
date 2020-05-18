import React from 'react';
import { getAvatarTitleAndColor } from '../utils';
import { Avatar } from 'react-native-elements'

export default ({title = '', source = null, ...props}) => {
  let avatarProps = getAvatarTitleAndColor(title);
  if (!source) {
    props = {
      ...props,
      overlayContainerStyle:{backgroundColor: avatarProps.color},
      title: avatarProps.title,
      activeOpacity:0.7
    }
  } else {
    props = {
      ...props,
      source: {uri: source},
      overlayContainerStyle:{backgroundColor: avatarProps.color},
      title: avatarProps.title,
      activeOpacity:0.7
    }
  }

  return (
    <Avatar {...props} rounded />
  )
}
