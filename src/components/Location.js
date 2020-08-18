import React, { PureComponent } from 'react';
import { View, TouchableHighlight, TouchableOpacity, FlatList, Text, ActivityIndicator } from 'react-native';
import RNGooglePlaces from 'react-native-google-places';
import { withChannelizeContext } from '../context';
import { theme } from '../styles/theme';
import { Icon, ListItem, Button, Input, SearchBar } from 'react-native-elements';
import styled from 'styled-components/native';
import debounce from 'lodash/debounce';
import Avatar from './Avatar'

const Container = styled.ScrollView`
  position: absolute;
  top: 0px;
  height: 100%;
  width: 100%;
  background-color: ${props => props.theme.location.backgroundColor };
  display: flex;
  flex-direction: column;
`;

const Header = styled.View`
  flex-direction: row;
  background-color: ${props => props.theme.location.backgroundColor };
  align-items: center;
  justify-content: center;
`;

const HeaderBackIcon = styled.View`
  margin-right: 15px;
`;

const HeaderTitle = styled.View`
  justify-content: center;
  flex-grow: 8;
`;

const HeaderTitleText = styled.Text`
  color: ${props => props.theme.location.header.titleColor };
  text-transform: capitalize;
  font-weight: bold;
  font-size: 15px;
`;

const HeaderIcons = styled.View`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const PlacesContainer = styled.View`
  width: 100%;
  background-color: ${props => props.theme.location.backgroundColor };
`;

const PlacePrimaryText = styled.Text`
  color: ${props => props.theme.location.place.primaryText };
  font-weight: bold;
`;

const PlaceSecondaryText = styled.Text`
  color: ${props => props.theme.location.place.secondaryText };
`;

class Location extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      error: null,
      currentPlaces: [],
      search: '',
      showSearchBar: false,
      loading: false,
      places: []
    }

    this._searchLocationOnServer = debounce(this._searchLocationOnServer, 800)
  }

  componentDidMount(prevProps) {
    this._init();
  }

  _init() {
    RNGooglePlaces.getCurrentPlace(['placeID', 'location', 'name', 'address'])
    .then((results) => {

      this._searchLocationOnServer(results[0].name, true)
    })
    .catch(error => {
      console.log(error);

      let { initialLocation } = this.props;
      if (!initialLocation) 
      {
        initialLocation = "Washington"
      }
      this._searchLocationOnServer(initialLocation, true)
    })
  }

  _toggleSearchInput = () => {
    const { showSearchBar } = this.state;
    this.setState(state => ({
      showSearchBar: !state.showSearchBar
    }))
  }

  _renderPlace = rowData => {
    const { theme } = this.props;
    const place = rowData.item;

    return (
      <ListItem
        component={TouchableHighlight}
        containerStyle={{ backgroundColor: theme.location.backgroundColor }}
        key={place.placeID}
        leftAvatar={this._getPlaceAvatar(place)}
        title={this._renderPlacePrimaryText(place)}
        subtitle={this._renderPlaceSecondaryText(place)}
        titleStyle={{ fontWeight: '500', fontSize: 16 }}
        subtitleStyle={{ fontWeight: '300', fontSize: 11 }}
        onPress={() => this._onPlacePress(place)}
      />
    );
  };

  _getPlaceAvatar = place => {
    const { theme } = this.props;

    return (
      <Avatar
        size="medium"
        rounded
        overlayContainerStyle={{backgroundColor: theme.colors.backgroundLightGreyColor}}
        icon={{name: 'location-on', color: theme.colors.primary}}
      />
    )
  }

  _renderPlacePrimaryText = place => {
    return (
      <View>
        <PlacePrimaryText numberOfLines={1}>{place.primaryText}</PlacePrimaryText>
      </View>
    );
  }

  _renderPlaceSecondaryText = place => {
    return (
      <View>
        <PlaceSecondaryText numberOfLines={1}>{place.secondaryText}</PlaceSecondaryText>
      </View>
    );
  }

  _resetSearch = () => {
    const { currentPlaces } = this.state;

    this.setState({
      search: '',
      places: currentPlaces
    });
  }

  _onChangeLocation = (value) => {
    this.setState({search: value})
    if (!value) {
      return
    }

    this._searchLocationOnServer(value);
  }

  _searchLocationOnServer = (value, init = false) => {
    let { client, options } = this.props;

    this.setState({loading: true});

    let predictonOptions = {}
    if (!options) {
      options = {};
    }

    RNGooglePlaces.getAutocompletePredictions(value, options)
    .then((results) => {

      let state = {
        loading: false,
        places: results
      }
      if (init) {
        state.currentPlaces = results;
      }

      this.setState(state);
    })
    .catch((error) => {
      console.log(error.message);

      this.setState({error: error});
    });
  }

  _onPlacePress = (place) => {
    const { onPlacePress } = this.props;

    function lookUpPlaceByID(place, successCallback) {
      RNGooglePlaces.lookUpPlaceByID(place.placeID)
      .then((results) => {

        if (successCallback && typeof successCallback == 'function') {
          successCallback(results)
        }
      })
      .catch((error) => {
        console.log(error.message)

      });
    }

    if (onPlacePress && typeof onPlacePress == 'function') {
      onPlacePress(place, lookUpPlaceByID)
    }
  }

  back = () => {
    const { onBack } = this.props;
    const { showSearchBar, currentPlaces } = this.state;

    if (showSearchBar) {
      this.setState({
        search: '',
        showSearchBar: false,
        places: currentPlaces
      })
      return
    }

    if (onBack && typeof onBack == 'function') {
      onBack()
    }
  }

  render() {
    const { theme } = this.props;
    const {
      error, 
      currentPlaces,
      search,
      showSearchBar,
      loading,
      places
     } = this.state;

    let headerStyle = {
      shadowColor: "#000",
      shadowOpacity: 0.18,
      shadowRadius: 1.00,
      elevation: 1
    }

    if (!showSearchBar) {
      headerStyle['padding'] = 10;
    } else {
      headerStyle['paddingLeft'] = 10;
    }

    return (
      <Container>
        <Header style={headerStyle}>
          <HeaderBackIcon>
            <TouchableOpacity onPress={this.back}>
              <Icon 
                name ="arrow-back" 
                size={30} 
                color={theme.colors.primary}
              />
            </TouchableOpacity>
          </HeaderBackIcon>
          { !showSearchBar && 
            <React.Fragment>
              <HeaderTitle>
                <HeaderTitleText>Location</HeaderTitleText>
              </HeaderTitle>
              <HeaderIcons>
                <TouchableOpacity onPress={this._toggleSearchInput}>
                  <Icon 
                    name ="search" 
                    size={30} 
                    color={theme.colors.primary}
                  />
                </TouchableOpacity>
              </HeaderIcons>
            </React.Fragment>
          }
          { showSearchBar &&
            <SearchBar
              containerStyle={{
                paddingBottom: 1,
                paddingTop: 1,
                width: "90%",
                backgroundColor: theme.location.searchBar.backgroundColor,
              }}
              inputStyle={{
                color: theme.location.searchBar.inputTextColor
              }}
              placeholder="Search"
              placeholderTextColor={theme.colors.textGrey}
              searchIcon={false}
              cancelIcon={false}
              platform={Platform.OS}
              onClear={this._resetSearch}
              onChangeText={this._onChangeLocation}
              value={search}
            />
          }
        </Header>
        <React.Fragment>
          <PlacesContainer>
            { loading && 
                <View>
                  <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            }
            { !!(!loading && currentPlaces.length) &&
              <FlatList
                renderItem={this._renderPlace}
                data={places}
                extraData={true}
                keyExtractor={(item, index) => item.placeID}
                ListEmptyComponent={<Text>No Place Found</Text>}
              />
            }
          </PlacesContainer>
        </React.Fragment>
      </Container>
    );
  }
};

Location = withChannelizeContext(
 theme(Location)
);

export default Location;