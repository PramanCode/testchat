import React from "react";
import {
    StyleSheet,
    TextInput,
    Button,
    View,
    KeyboardAvoidingView,
    ActivityIndicator,
    ScrollView,
    Alert
} from "react-native";
import firebase from "firebase";
import AsyncStorage from '@react-native-async-storage/async-storage';

const styles = StyleSheet.create({
    textInput: {
        marginTop: 10,
        padding: 5,
        borderWidth: 1,
        borderColor: 'green',
        borderRadius: 10
    }
});


export default class SignupScreen extends React.Component {

    static navigationOptions = { title: "Please SignUp", headerTitleStyle: { color: 'green' } };

    constructor(props) {
        super(props);
        this.state = {
            name: "",
            password: "",
            email: "",
            isLoading: false
        };
        this.makeConnection = this.makeConnection.bind(this);
        this.checkSignUpForm = this.checkSignUpForm.bind(this);
    }

    componentDidMount() {
        console.log("did mount");
    }


    makeConnection() {
        var firebaseDatabase = firebase.database();
        this.setState({ isLoading: true });
        firebase
            .auth()
            .setPersistence(firebase.auth.Auth.Persistence.LOCAL)
            .then(async () => {
                return await firebase.auth().createUserWithEmailAndPassword(this.state.email, this.state.password);
            })
            .then(async () => {
                this.userKey = firebase.auth().currentUser.uid;
                console.log("user key :" + this.userKey);
                return await AsyncStorage.setItem('@userId', this.userKey);
            })
            .then(async () => {
                return await firebaseDatabase.ref("users/").update({
                    [this.userKey]: {
                        name: this.state.name,
                        email: this.state.email,
                        password: this.state.password
                    }
                })
            })
            .then(() => {
                this.props.navigation.navigate('Chat', { 'userId': this.userKey, 'userName': this.state.email });
            })
            .catch(err => { console.log(err); })
            .catch(error => {
                console.log(error);

            })
    }

    checkSignUpForm() {
        if (this.state.name == "") {
            Alert.alert('Name error', 'Name cannot be empty');
            this.nameInput.focus();
            return;
        }

        if (this.state.email.length == 0) {
            Alert.alert('Email error', 'Email cannot be empty');
            this.emailInput.focus();
            return;
        }
        var emailFormat = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
        if (emailFormat.test(this.state.email) == false) {
            Alert.alert('Email error', 'PLease enter correct email Id');
            this.emailInput.focus();
            return;
        }
        if (this.state.password.length < 6) {
            Alert.alert('Password error', 'Password length should be atleast 6 characters');
            return;
        }
        this.makeConnection();
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
                        flex: 1
                    }}
                    contentContainerStyle={{ justifyContent: 'center', padding: 20, paddingTop: 60, flexGrow: 1, flexShrink: 1 }}
                    keyboardShouldPersistTaps={'handled'}
                >
                    <TextInput
                        ref={(ref) => this.nameInput = ref}
                        style={styles.textInput}
                        placeholder="Name"
                        value={this.state.firstName}
                        onChangeText={name => this.setState({ name: name })}
                        returnKeyType={'next'}
                        onSubmitEditing={() => this.emailInput.focus()}
                    />
                    <TextInput
                        ref={(ref) => this.emailInput = ref}
                        style={styles.textInput}
                        placeholder="Contact Email"
                        onChangeText={email => this.setState({ email: email })}
                        returnKeyType={'next'}
                        onSubmitEditing={() => this.passwordInput.focus()}
                    />
                    <TextInput
                        ref={(ref) => this.passwordInput = ref}
                        style={styles.textInput}
                        secureTextEntry={true}
                        placeholder="Password"
                        onChangeText={pass => this.setState({ password: pass })}
                        onSubmitEditing={() => this.checkSignUpForm()}
                    />
                    <View style={{ marginTop: 60 }}>
                        <Button
                            onPress={() => {
                                this.checkSignUpForm();
                            }}
                            title="SignUp"
                            color="#00695C"
                        />
                    </View>
                    <View style={{ margin: 50 }}>
                        <Button
                            onPress={() => this.props.navigation.navigate("Login")}
                            title="Login Here!"
                            color="#00695C"
                        />
                    </View>
                </ScrollView>
            </View>
        );
    }
}
