import React from "react";
import { TextInput, Alert, StyleSheet, View, Text, Button, FlatList, ToastAndroid, ScrollView, TouchableOpacity } from 'react-native';
import Storage from "../components/Storage";

/* TODO
1. Add settings types into SETTINGS
2. Make UI for each settings types
*/

// TODO: Stuck - 1. How to get Settings info? 2. Can I get all settings info in 1 go?

const SettingsType = {
  "boolean": 0,
  "numeric": 1,
  "text": 2,
  "language": 3
};

const SETTINGS = [
  {
    id: "displayTimeOut",
    title: "Display TimeOut",
    type: SettingsType.numeric
  },
  {
    id: "doNotDisturb",
    title: "Do Not Disturb",
    type: SettingsType.boolean
  },
  {
    id: "language",
    title: "Language",
    type: SettingsType.language
  },
  {
    id: "appEnable",
    title: "App Enable/Disable",
    type: SettingsType.boolean
  },
  {
    id: "bluetoothName",
    title: "Bluetooth Device Name",
    type: SettingsType.text
  },
  {
    id: "audioLoudness",
    title: "Audio Loudness",
    type: SettingsType.numeric
  }
];

class SettingsScreen extends React.Component { 
  constructor(props) {
    super();
    this.state = {
      displayTimeOut: null,
      doNotDisturb: null,
      language: null,
      appEnable: null,
      bluetoothName: null,
      audioLoudness: null,
    };
    setTimeout(() => {
      this.fetchSettingsInfo();
    }, 1000);
  };

  fetchSettingsInfo = async () => {
    console.log("Fetching Settings information from AsyncStorage");
    // TODO: change this to save object instead of text.

    const displayTimeOutPromise = Storage.fetchText('@displayTimeOut');
    displayTimeOutPromise.then((v) => this.setState({'displayTimeOut': v}));

    const doNotDisturbPromise = Storage.fetchText('@doNotDisturb');
    doNotDisturbPromise.then((v) => this.setState({'doNotDisturb': v}));

    const languagePromise = Storage.fetchText('@language');
    languagePromise.then((v) => this.setState({'language': v}));

    const appEnablePromise = Storage.fetchText('@appEnable');
    appEnablePromise.then((v) => this.setState({'appEnable': v}));

    const bluetoothNamePromise = Storage.fetchText('@bluetoothName');
    bluetoothNamePromise.then((v) => this.setState({'bluetoothName': v}));

    const audioLoudnessPromise = Storage.fetchText('@audioLoudness');
    audioLoudnessPromise.then((v) => this.setState({'audioLoudness': v}));
  }

  updateState = (id, text) => {
    this.setState({[id]: text});
  }

  send = (id, text) => {
    Storage.saveText("@" + id, text);
    console.log("Send | id = " + id + ", text = " + text);  // TODO
  }

  updateStateAndSend = (id, text) => {
    this.updateState(id, text)
    this.send(id, text);
  }

  gridItem = (itemData) => {
    return (
      <View>
        {itemData.item.type == SettingsType.boolean && <View>
          <Text>{itemData.item.title}</Text>
          <Button title="True" onPress={() => this.updateStateAndSend(itemData.item.id, "true")}/>
          <Button title="False" onPress={() => this.updateStateAndSend(itemData.item.id, "false")}/>
        </View>}
        {itemData.item.type == SettingsType.numeric && <View>
          <Text>{itemData.item.title}</Text>
          <TextInput keyboardType='numeric' 
            onChangeText={(text) => this.updateState(itemData.item.id, text)}
            value={this.state[itemData.item.id]}
            maxLength={10}  //setting limit of input
          />
          <Button title="Send" onPress={() => {this.send(itemData.item.id, this.state[itemData.item.id])}}/>
        </View>}
        {itemData.item.type == SettingsType.text && <View>
          <Text>{itemData.item.title}</Text>
          <TextInput
            onChangeText={(text) => this.updateState(itemData.item.id, text)}
            value={this.state[itemData.item.id]}
          />
          <Button title="Send" onPress={() => {this.send(itemData.item.id, this.state[itemData.item.id])}}/>
        </View>}
        {itemData.item.type == SettingsType.language && <View>
          <Text>{itemData.item.title}</Text>
          {/* 1 = chinese, 2 = english*/}
          <Button title="Chinese" onPress={() => this.updateStateAndSend(itemData.item.id, "1")}/>
          <Button title="English" onPress={() => this.updateStateAndSend(itemData.item.id, "2")}/>
        </View>}
        <View style={styles.lineStyle}/>
      </View>
    )
  }

  render() {
    return (
      <View>
      {/* <Text>SettingsScreen</Text> */}
        <FlatList keyExtractor={(item, index) => item.id} data={SETTINGS} renderItem={this.gridItem}/>
        <Button title="Debug" onPress={() => {console.log(this.state)}}/>
      </View>
    );
  }
}


const styles = StyleSheet.create({
  gridItem: {
    height: 60,
    borderWidth: 0.5,
    borderColor: 'gray',
  },
  lineStyle:{
    borderWidth: 0.5,
    borderColor:'black',
    margin:10,
  }
})

export default SettingsScreen;