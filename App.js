import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import firebase from "firebase";
import ChatScreen from './Chat';
import SignupScreen from './Signup';
import LoginScreen from './Login';
import { createStackNavigator } from "react-navigation-stack";
import { createSwitchNavigator, createAppContainer } from "react-navigation";
import AsyncStorage from '@react-native-async-storage/async-storage';

const configFirebase = {
  apiKey: "AIzaSyCf1tmxlB1psWda53hTp8Y2OftP3FM9yag",
  authDomain: "fir-1cde2.firebaseapp.com",
  databaseURL: "https://fir-1cde2.firebaseio.com",
  storageBucket: "fir-1cde2.appspot.com"
};

class AuthLoading extends React.Component {
  constructor(props) {
    super(props);
    if (!firebase.apps.length) {
      firebase.initializeApp(configFirebase);
    }
  }

  state = {
    isLoading: true,
    userId: null
  }

  componentDidMount() {
    AsyncStorage.getItem('@userId')
      .then((userId) => {
        this.setState({ isLoading: false, userId: userId });
        if (userId) {
          this.props.navigation.navigate('Chat');
        } else {
          this.props.navigation.navigate('Signup');
        }

      })
  }
  render() {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignContent: 'center' }}>
        <ActivityIndicator size={'large'} />
      </View>
    )
  }
}


const EntryStack = createStackNavigator(
  {
    Signup: {
      screen: SignupScreen
    },
    Login: {
      screen: LoginScreen
    }
  },
  {
    initialRouteName: "Signup"
  }
);

const AppNavigator = createSwitchNavigator({
  'Auth': EntryStack,
  'Chat': ChatScreen,
  'AuthLoading': AuthLoading
}, {
  initialRouteName: 'AuthLoading'
})

const AppContainer = createAppContainer(AppNavigator);


export default class App extends React.Component {

  render() {
    return (
      <AppContainer />
    );
  }
}