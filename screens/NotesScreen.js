import React from 'react';
import { View, Text, TextInput, Button, StyleSheet, ToastAndroid } from 'react-native';

class NotesScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      notes: ""
    }
  };

  // TODO
  generateMsg(){
    return this.state.notes;
  };

  render() {
    return (
      <View style={{margin: 10}}>
        <Text>NotesScreen</Text>
        <TextInput
            placeholder="Notes"
            value={this.state.notes}
            onChangeText={v => this.setState({"notes": v})}
          />
        <Button title="Send Notes" onPress = {() => {
          // TODO: Placeholder. Should update this.props.characteristics.
          ToastAndroid.show("Send Notes: " + this.generateMsg(), ToastAndroid.SHORT);
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

export default NotesScreen;