import React from "react";
import { TextInput, Alert, StyleSheet, View, Text, Button, FlatList, ToastAndroid, ScrollView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

class DemoComponent extends React.Component { 
  constructor(props) {
    super();
    this.state = {
      writeVal: "",
      readVal: ""
    };

    this.onPressRead();
  };

  onPressWrite = async(value) => {
    console.log("onPressWrite");
    try {
      this.setState({writeVal: value});

      console.log("Writing to async storage");
      await AsyncStorage.setItem('DemoKey', value)
      console.log("Successfully written to async storage");
    } catch (e) {
      console.log(e);
    }
  };

  onPressRead = async() => {
    console.log("onPressRead");
    try {
      console.log("Reading from asyncStorage");
      const value = await AsyncStorage.getItem('DemoKey');
      console.log("Successfully read from asyncStorage");

      if(value !== null) {
        console.log("value is " + value);
        this.setState({readVal: value});
      } else {
        console.log("No Value");
      }
    } catch(e) {
      console.log(e);
    }  
  };

  render() {
    return (
      <View>
        <TextInput
            placeholder="writeVal"
            value={this.state.writeVal}
            onChangeText={v => this.onPressWrite(v)}
          />
        <Button type="primary" style={{ marginTop: 8 }} onPress={this.onPressRead} title="Read"/>
        <Text>Read Value: {this.state.readVal}</Text>
      </View>
    );
  }
}

export default DemoComponent;