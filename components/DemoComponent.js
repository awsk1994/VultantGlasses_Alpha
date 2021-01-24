import React from "react";
import { TextInput, Alert, StyleSheet, View, Text, Button, FlatList, ToastAndroid, ScrollView, TouchableOpacity } from 'react-native';
import BLEUtils from "./BLEUtils.js";

class DemoComponent extends React.Component { 
  // constructor(props) {
  //   super();
  //   console.log(this.props);
  //   this.props.updateTextA("abc");
  // };

  render() {
    return (
      <View>
        <TextInput
            placeholder="updateTextA"
            value={this.props.textA}
            onChangeText={v => this.props.updateTextA(v)}
          />
      </View>
    );
  }
}

export default DemoComponent;