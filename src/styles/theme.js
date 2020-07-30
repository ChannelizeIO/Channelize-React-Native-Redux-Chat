import React from 'react';
import merge from 'lodash/merge';
import { ThemeProvider, ThemeConsumer, ThemeContext } from 'styled-components/native';

export const Colors = {
  primary: '#0084ff',
  secondary: '#111',
  danger: '#ff0000',
  disabled: '#D1D5D8',
  textLight: '#FFFFFF',
  textDark: '#000',
  textGrey: '#b2b2b2',
  backgroundLightColor: '#FFFFFF',
  backgroundDarkColor: '#000',
  backgroundGreyColor: '#242526',
  backgroundLightGreyColor: '#F0F2F5',
  hoverGreyColor: '#b2b2b2',
  greenColor: "#64ba00"
};

export const lightTheme = {
  theme: "light",
  colors: {
    ...Colors,
  },
  conversationList: {
  	backgroundColor: Colors.backgroundLightColor,
  	hoverColor: Colors.hoverGreyColor,
  	header: {
  	  titleColor: Colors.textDark
  	},
  	title: {
  	  color: Colors.textDark
  	},
  	date: {
  	  color: Colors.textGrey	
  	},
  	message: {
  	  textColor: Colors.textGrey,
  	  unreadCountColor: Colors.primary,
  	}
  },
  conversationWindow: {
  	backgroundColor: Colors.backgroundLightColor,
  	header: {
  	  titleColor: Colors.textDark,
  	  subtitleColor: Colors.textGrey
  	},
  	date: {
  	  color: Colors.textGrey	
  	},
  	message: {
  	  bubbleColor: Colors.primary,
  	  textColor: Colors.textLight
  	}
  },
  ConversationDetails: {
  	backgroundColor: Colors.backgroundLightGreyColor,
  	header: {
  	  backgroundColor: Colors.backgroundLightColor,
  	  titleColor: Colors.textDark,
  	  subtitleColor: Colors.textGrey
  	},
  	details: {
  	  titleColor: Colors.textDark
  	},
    input: {
      color: Colors.textDark
    },
  	member: {
  	  backgroundColor: Colors.backgroundLightColor,
  	  displayNameColor: Colors.textDark,
  	  roleColor: Colors.textGrey
  	},
  	primaryActionButtons: {
  	  backgroundColor: Colors.backgroundLightColor,
  	  buttonTitleColor: Colors.primary
  	},
  	redActionButtons: {
  	  backgroundColor: Colors.backgroundLightColor,
  	  buttonTitleColor: Colors.danger
  	}
  },
  contactList: {
  	backgroundColor: Colors.backgroundLightColor,
  	header: {},
    searchBar: {
      inputTextColor: Colors.textDark,
      backgroundColor: Colors.backgroundLightColor,
    },
  	user: {
  	  displayNameColor: Colors.textDark
  	}
  },
  addMembers: {
    backgroundColor: Colors.backgroundLightColor,
    header: {
      titleColor: Colors.textDark,
    },
    searchBar: {
      inputTextColor: Colors.textDark,
      backgroundColor: Colors.backgroundLightColor,
    },
    user: {
      displayNameColor: Colors.textDark
    }
  },
  createGroup: {
    backgroundColor: Colors.backgroundLightColor,
    header: {
      titleColor: Colors.textDark,
    },
    searchBar: {
      inputTextColor: Colors.textDark,
      backgroundColor: Colors.backgroundLightColor,
    },
    input: {
      color: Colors.textDark
    },
    user: {
      displayNameColor: Colors.textDark
    }
  },
  location: {
    backgroundColor: Colors.backgroundLightColor,
    header: {
      titleColor: Colors.textDark,
    },
    searchBar: {
      inputTextColor: Colors.textDark,
      backgroundColor: Colors.backgroundLightColor,
    },
    place: {
      primaryText: Colors.textDark,
      secondaryText: Colors.textGrey
    }
  }
}

export const darkTheme = {
  theme: "dark",
  colors: {
    ...Colors,
  },
  conversationList: {
  	backgroundColor: Colors.backgroundDarkColor,
  	header: {
  	  titleColor: Colors.textLight
  	},
  	title: {
  	  color: Colors.textLight
  	},
  	date: {
  	  color: Colors.textGrey	
  	},
  	message: {
  	  textColor: Colors.textGrey,
  	  unreadCountColor: Colors.primary
  	}
  },
  conversationWindow: {
  	backgroundColor: Colors.backgroundDarkColor,
  	header: {
  	  titleColor: Colors.textLight,
  	  subtitleColor: Colors.textGrey
  	},
  	date: {
  	  color: Colors.textGrey
  	},
  	message: {
  	  bubbleColor: Colors.primary,
  	  textColor: Colors.textLight,
  	  dateColor: Colors.textGrey
  	}
  },
  ConversationDetails: {
  	backgroundColor: Colors.backgroundDarkColor,
  	header: {
  	  backgroundColor: Colors.backgroundGreyColor,
  	  titleColor: Colors.textLight,
  	  subtitleColor: Colors.textGrey
  	},
  	details: {
  	  titleColor: Colors.textLight
  	},
    input: {
      color: Colors.textLight
    },
  	member: {
  	  backgroundColor: Colors.backgroundGreyColor,
  	  displayNameColor: Colors.textLight,
  	  roleColor: Colors.textGrey
  	},
  	primaryActionButtons: {
  	  backgroundColor: Colors.backgroundGreyColor,
  	  buttonTitleColor: Colors.primary
  	},
  	redActionButtons: {
  	  backgroundColor: Colors.backgroundGreyColor,
  	  buttonTitleColor: Colors.danger
  	}
  },
  contactList: {
  	backgroundColor: Colors.backgroundDarkColor,
  	header: {},
    searchBar: {
      inputTextColor: Colors.textLight,
      backgroundColor: Colors.backgroundDarkColor,
    },
  	user: {
  	  displayNameColor: Colors.textLight
  	}
  },
  addMembers: {
    backgroundColor: Colors.backgroundDarkColor,
    header: {
      titleColor: Colors.textLight,
    },
    searchBar: {
      inputTextColor: Colors.textLight,
      backgroundColor: Colors.backgroundDarkColor,
    },
    user: {
      displayNameColor: Colors.textLight
    }
  },
  createGroup: {
    backgroundColor: Colors.backgroundDarkColor,
    header: {
      titleColor: Colors.textLight,
    },
    searchBar: {
      inputTextColor: Colors.textLight,
      backgroundColor: Colors.backgroundDarkColor,
    },
    input: {
      color: Colors.textLight
    },
    user: {
      displayNameColor: Colors.textLight
    }
  },
  location: {
    backgroundColor: Colors.backgroundDarkColor,
    header: {
      titleColor: Colors.textLight,
    },
    searchBar: {
      inputTextColor: Colors.textLight,
      backgroundColor: Colors.backgroundDarkColor,
    },
    place: {
      primaryText: Colors.textLight,
      secondaryText: Colors.textGrey
    }
  }
}

export const ChannelizeThemeContext = ThemeContext; //React.createContext({ theme: null });
export const ChannelizeThemeProvider = ThemeProvider; //ChannelizeThemeContext.Provider;

export const theme = (OriginalComponent) => {
  const ThemedComponent = ({theme, ...props}) => (
    <ThemeConsumer>
      {(themeProviderTheme) => {
      	if (!theme && themeProviderTheme) {
      	  return <OriginalComponent theme={themeProviderTheme} {...props} />;
      	}

        let modifiedTheme = themeProviderTheme || theme || lightTheme;
        if (modifiedTheme.theme == 'dark') {
          modifiedTheme = merge({}, modifiedTheme, darkTheme)
        } else {
          modifiedTheme = merge({}, modifiedTheme, lightTheme)
        }

        return (
	      <ThemeProvider theme={modifiedTheme}>
      	    <OriginalComponent theme={modifiedTheme} {...props} />
          </ThemeProvider>
        );
      }}
    </ThemeConsumer>
  );
  ThemedComponent.themePath = OriginalComponent.themePath;
  ThemedComponent.extraThemePaths = OriginalComponent.extraThemePaths;
  ThemedComponent.displayName = `Themed${getDisplayName(OriginalComponent)}`;
  return ThemedComponent;
};

function getDisplayName(OriginalComponent) {
  return OriginalComponent.displayName || OriginalComponent.name || 'Component';
}