import React from 'react';

export const ChannelizeContext = React.createContext({ client: null });

export const ChannelizeProvider = ChannelizeContext.Provider;

export function withChannelizeContext(OriginalComponent) {
  const ContextAwareComponent = getContextAwareComponent(
    ChannelizeContext,
    OriginalComponent,
  );
  return ContextAwareComponent;
}

const getContextAwareComponent = function(context, originalComponent) {
  const Context = context;
  const OriginalComponent = originalComponent;
  const ContextAwareComponent = function(props) {
    return (
      <Context.Consumer>
        {(c) => <OriginalComponent {...c} {...props} />}
      </Context.Consumer>
    );
  };

  ContextAwareComponent.themePath = OriginalComponent.themePath;
  ContextAwareComponent.extraThemePaths = OriginalComponent.extraThemePaths;
  ContextAwareComponent.displayName =
    OriginalComponent.displayName || OriginalComponent.name || 'Component';
  ContextAwareComponent.displayName = ContextAwareComponent.displayName.replace(
    'Base',
    '',
  );

  return ContextAwareComponent;
};