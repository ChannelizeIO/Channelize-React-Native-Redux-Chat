import React, { PureComponent } from 'react';
import { Overlay as RNOverlay } from 'react-native-elements';
import { withChannelizeContext } from '../context';
import { theme } from '../styles/theme';

class Overlay extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      visible: true,
    }
  }

  toggleOverlay = () => {
    const { onBackDropPress } = this.props
    console.log("onBackDropPress", onBackDropPress)
    if (onBackDropPress && typeof onBackDropPress == 'function') {
      this.setState((state) => ({
        visible: !state.visible
      }));
      onBackDropPress();
    }
  };

  render() {
    const { visible } = this.state;
    const { style } = this.props;

    let overlayStyle = {
      padding: 40,
      justifyContent: 'center',
      alignItems: 'center',
    }
    if (style) {
      overlayStyle = style
    }

    return (
      <RNOverlay overlayStyle={overlayStyle} isVisible={visible} onBackdropPress={this.toggleOverlay}>
        { this.props.children }
      </RNOverlay>
    )
  }
}

Overlay = withChannelizeContext(
 theme(Overlay)
);

export default Overlay;