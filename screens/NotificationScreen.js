import React from 'react';
import { View, Text, TextInput, Button, StyleSheet, ToastAndroid } from 'react-native';

class NotificationScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      appName: "",
      contact: "",
      content: ""
    }
  };

  // TODO
  generateMsg(){
    return this.state.appName + "," + this.state.contact + "," + this.state.content;
  };

  render() {
    return (
      <View style={{margin: 10}}>
        <Text>NotificationScreen</Text>
        <TextInput
            placeholder="App Name"
            value={this.state.appName}
            onChangeText={v => this.setState({"appName": v})}
          />
        <TextInput
            placeholder="Contact"
            value={this.state.contact}
            onChangeText={v => this.setState({"contact": v})}
          />
        <TextInput
            placeholder="Content"
            value={this.state.content}
            onChangeText={v => this.setState({"content": v})}
          />
        <Button title="Send Notification" onPress = {() => {
          // TODO: Placeholder. Should update this.props.characteristics.
          ToastAndroid.show("Send Notification: " + this.generateMsg(), ToastAndroid.SHORT);
        }}/>
      </View>
    )
  };
}

// TODO: generate styles
const styles = StyleSheet.create({
  "button": {
    margin: 10
  }
})

export default NotificationScreen;