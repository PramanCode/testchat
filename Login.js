import React from "react";
import {
    StyleSheet,
    View,
    ActivityIndicator,
    TextInput,
    Button,
    ScrollView,
    Alert
} from "react-native";
import firebase from "firebase";
import AsyncStorage from '@react-native-async-storage/async-storage';

const styles = StyleSheet.create({
    textInput: { marginTop: 10, padding: 5, borderWidth: 1, borderColor: 'green', borderRadius: 10 }
});

export default class LoginScreen extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            email: "",
            password: "",
            isLoading: false
        };
    }

    doLogin() {
        firebase
            .auth()
            .signInWithEmailAndPassword(this.state.email, this.state.password)
            .then(async (obj) => {
                this.userKey = obj.uid;
                await AsyncStorage.setItem('@userId', this.userKey)
                    .then(() => {
                        this.setState({ isLoading: false });
                        this.props.navigation.navigate('Chat', { 'userId': this.userKey, 'userName': this.state.email });
                    });

            })
            .catch((error) => {
                if (error == "Error: There is no user record corresponding to this identifier.The user may have been deleted.") {
                    Alert.alert('Login Failure', 'Email id already exists');
                    this.setState({ isLoading: false });
                    return;
                }
                if (error == "Error: The password is invalid or the user does not have a password.") {
                    Alert.alert('Login Failure', 'The password is invalid or the user does not have a password.');
                    this.setState({ isLoading: false });
                    return;
                }
                this.setState({ isLoading: false });
            });
    }

    checkLoginCredentials = () => {
        var emailFormat = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
        if (emailFormat.test(this.state.email) == false) {
            //this.emailInput.focus();
            Alert.alert('Login Failure', 'Please enter correct email.');
            return;
        }
        if (this.state.password.length < 6) {
            //this.passwordInput.focus();
            Alert.alert('Login Failure', 'Please enter correct password.');
            return;
        }
        this.setState({ isLoading: true });
        this.doLogin();
    }

    render() {
        if (this.state.isLoading) {
            return (
                <View style={{ flex: 1 }}>
                    <ActivityIndicator size={'large'} color={'#008000'} />
                </View>
            );
        }
        return (
            <View style={{ flex: 1 }}>
                <ScrollView
                    style={{
                        flex: 1,
                        margin: 30,
                        marginTop: 100,
                        backgroundColor: "#fff",
                    }}
                    contentContainerStyle={{ flex: 1 }}
                    keyboardShouldPersistTaps={'handled'}
                >
                    <TextInput
                        ref={(ref) => this.emailInput = ref}
                        style={styles.textInput}
                        placeholder="Email"
                        onChangeText={email => this.setState({ email: email })}
                        returnKeyType={'next'}
                        onSubmitEditing={() => this.passwordInput.focus()}
                    />
                    <TextInput
                        ref={(ref) => this.passwordInput = ref}
                        style={styles.textInput}
                        secureTextEntry={true}
                        placeholder="Password"
                        onChangeText={password => this.setState({ password: password })}
                        onSubmitEditing={() => this.checkLoginCredentials()}
                    />
                    <View style={{ marginTop: 60 }}>
                        <Button
                            onPress={e => {
                                this.checkLoginCredentials();
                            }}
                            title="Login"
                            color="#00695C"
                        />
                    </View>
                    <View style={{ margin: 50 }}>
                        <Button
                            onPress={() => this.props.navigation.goBack()}
                            title="SignUp Here!"
                            color="#00695C"
                        />
                    </View>
                </ScrollView>
            </View>
        );
    }
}
