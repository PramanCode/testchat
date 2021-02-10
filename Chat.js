import React, { Component } from "react";
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    Button,
    FlatList
} from "react-native";
import firebase from "firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default class ChatScreen extends Component {

    constructor(props) {
        super(props);
        this.sendMessage = this.sendMessage.bind(this);
        this.userName = '';
        this.state = {
            messages: [],
            text: '',
            typingName: ''
        };
        this.onChangeText = this.onChangeText.bind(this);
        this.cancelTyping = this.cancelTyping.bind(this);
    }

    async getUser() {
        await AsyncStorage.getItem('@userId').then((userId) => {
            firebase.database().ref('users/' + userId)
                .once('value', (snapshot) => {
                    this.userName = snapshot.val().name;
                    this.makeConnection();
                })
        })
    }

    componentDidMount() {
        this.getUser();
    }

    onChangeText = (text) => {
        this.setState({ text: text });
        this.updateTyping();
    }

    makeConnection() {
        firebase.database().ref('messages/').on('value', (snapshot) => {
            let messageArray = [];
            Object.entries(snapshot.val())
                .forEach(i => {
                    messageArray.push({ 'id': i[0], 'name': i[1].name, 'text': i[1].text });
                });
            this.setState({ messages: messageArray });

        });
        firebase.database().ref('isTyping')
            .on('value', (snapshot) => {
                this.setState({ typingName: snapshot.val() });
            });
    }

    sendMessage = async () => {
        const key = firebase.database().ref("messages/").push().key;
        let time = new Date().getTime();
        await firebase.database().ref('messages/').child(key).set({
            'name': this.userName,
            'text': this.state.text,
            'time': time
        })
            .then(() => { this.setState({ text: '' }) })
            .catch(e => console.log(e))
    }

    cancelTyping = async () => {
        await firebase.database().ref('isTyping').set('')
            .catch(e => console.log('e: ' + e));
    }

    async updateTyping() {
        await firebase.database().ref('isTyping').set(this.userName)
            .catch(e => console.log('e: ' + e));
        setTimeout(this.cancelTyping, 1000);
    }

    async onClick() {
        await AsyncStorage.clear().then(() => this.props.navigation.navigate('Login'));
    }

    renderMessage = ({ item, index }) => (
        <View style={{ marginVertical: 10, padding: 5, backgroundColor: '#f2ffcc' }}>
            <Text>{item.text}</Text>
        </View>
    )

    render() {
        return (
            <View style={{ flex: 1 }}>
                <View style={styles.button}>
                    <Button
                        onPress={() => this.onClick()}
                        title="Log Out"
                    />
                </View>
                <Text style={styles.typingText}>
                    {this.state.typingName != '' ? this.state.typingName + ' is typing' : ''}
                </Text>
                <FlatList
                    data={this.state.messages}
                    style={{ flex: 1, backgroundColor: '#ffe6e6' }}
                    renderItem={this.renderMessage}
                    keyExtractor={(item, index) => String(index)}
                />
                <TextInput
                    style={{ alignSelf: 'stretch', padding: 5, marginBottom: 5 }}
                    placeholder={'Enter your message'}
                    onChangeText={this.onChangeText}
                    value={this.state.text}
                    onSubmitEditing={this.sendMessage}
                    onEndEditing={(e) => console.log('end')}
                />
            </View>
        )
    }

}

const styles = StyleSheet.create({
    typingText: { paddingVertical: 5, backgroundColor: '#ccffe6' },
    button: { marginTop: 50, alignSelf: 'flex-end' }
})