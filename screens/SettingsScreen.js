import React from "react";
import { TextInput, Alert, StyleSheet, View, Text, Button, FlatList, ToastAndroid, ScrollView, TouchableOpacity } from 'react-native';
import Storage from "../components/Storage";
import BLEUtils from "../components/BLEUtils";
import BLERead from "../components/BLERead";
// TODO: Stuck - 1. How to get Settings info? 2. Can I get all settings info in 1 go?
// TODO: Time/Date Settings

const SettingsType = {
  "boolean": 0,
  "numeric": 1,
  "text": 2,
  "language": 3
};

const SETTINGS = [
  {
    id: "displayTimeOut",
    title: "熄屏时间（Display TimeOut）",
    type: SettingsType.numeric,
    sAttri1HexStr: "56" // HARDCODED
  },
  // {
  //   id: "doNotDisturb",
  //   title: "Do Not Disturb",
  //   type: SettingsType.boolean,
  //   sAttri1HexStr: "59" // HARDCODED (not in document)
  // },
  {
    id: "language",
    title: "语言（Language）",
    type: SettingsType.language,
    sAttri1HexStr: "52" // HARDCODED
  },
  // {
  //   id: "appEnable",
  //   title: "App Enable/Disable",
  //   type: SettingsType.boolean,
  //   sAttri1HexStr: "60" // HARDCODED (not in document)
  // },
  {
    id: "bluetoothName",
    title: "蓝牙装置名称（Bluetooth Device Name）",
    type: SettingsType.text,
    sAttri1HexStr: "58" // HARDCODED
  }
];

class SettingsScreen extends React.Component { 
  constructor({props, route}) {
    super();
    this.state = {
      displayTimeOut: null,
      doNotDisturb: null,
      language: null,
      appEnable: null,
      bluetoothName: null,
      audioLoudness: null,
      vMsgHeader: "A0", // Hardcoded
      vMsgPAttri: "05", // Hardcoded
      vMsgSAttri2: "00", // Hardcoded
      characteristic: route.params.characteristic
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

  updateState = (item, text) => {
    this.setState({[item.id]: text});
  }

  sendTextAndSave = (item, content) => {
    this.sendText(item, content);
    Storage.saveText("@" + item.id, content);
  }

  sendNumberAndSave = (item, content) => {
    this.sendNumber(item, content);
    Storage.saveText("@" + item.id, content);
  }

  sendNumber = (item, content) => {
    this.send(item, BLEUtils.numStrToHex(content));
  }

  sendText = (item, content) => {
    this.send(item, BLEUtils.utf8ToUtf16Hex(content))
  };

  send = (item, contentHexStr) => {
    console.log("sendAndSave | sAttri1 = " + item.sAttri1HexStr
      + ", id = " + item.id + ", contentHexStr = " + contentHexStr);  // TODO

    const hexMsg = this.state.vMsgHeader 
    + this.state.vMsgPAttri 
    + item.sAttri1HexStr
    + this.state.vMsgSAttri2
    + contentHexStr;

    const CRCHex = BLEUtils.sumHex(hexMsg);
    console.log("onPressWriteCharacteristic | hexMsg with CRC | " + (hexMsg + CRCHex));

    SuccessWriteFn = () => {
      Alert.alert('成功写入特征值', '现在点击读取特征值看看吧...');
    };

    ErrWriteFn = (err) => {
      console.log('写入特征值出错：', err)
      ToastAndroid.show("ERROR: " + err, ToastAndroid.SHORT);
    }

    BLEUtils.writeHexOp(hexMsg + CRCHex, this.state.characteristic, SuccessWriteFn, ErrWriteFn);
  };

  updateSendSaveLang = (item, text) => {
    this.updateState(item, text)
    this.sendNumber(item, text);    // language is a number. 1 = chinese, 2 = english
    Storage.saveText("@" + item.id, text);
  }

  gridItem = (itemData) => {
    return (
      <View>
        {/* {itemData.item.type == SettingsType.boolean && <View>
          <Text>{itemData.item.title}</Text>
          <Button title="True" onPress={() => this.updateStateAndSendSave(itemData.item, "true")}/>
          <Button title="False" onPress={() => this.updateStateAndSendSave(itemData.item, "false")}/>
        </View>} */}
        {itemData.item.type == SettingsType.numeric && <View>
          <Text>{itemData.item.title}</Text>
          <TextInput keyboardType='numeric' 
            onChangeText={(text) => this.updateState(itemData.item, text)}
            value={this.state[itemData.item.id]}
            maxLength={10}  //setting limit of input
          />
          <Button title="写特征/发送（Send）" onPress={() => {this.sendNumberAndSave(itemData.item, this.state[itemData.item.id])}}/>
        </View>}
        {itemData.item.type == SettingsType.text && <View>
          <Text>{itemData.item.title}</Text>
          <TextInput
            onChangeText={(text) => this.updateState(itemData.item, text)}
            value={this.state[itemData.item.id]}
          />
          <Button title="写特征/发送（Send）" onPress={() => {this.sendTextAndSave(itemData.item, this.state[itemData.item.id])}}/>
        </View>}
        {itemData.item.type == SettingsType.language && <View>
          <Text>{itemData.item.title}</Text>
          {/* 1 = chinese, 2 = english*/}
          <Button title="选择中文（Chinese）并发送" onPress={() => this.updateSendSaveLang(itemData.item, "1")}/>
          <Button title="选择英文（English）并发送" onPress={() => this.updateSendSaveLang(itemData.item, "2")}/>
        </View>}
        <View style={styles.lineStyle}/>
      </View>
    )
  }

  render() {
    return (
      <ScrollView>
      {/* <Text>SettingsScreen</Text> */}
        <FlatList keyExtractor={(item, index) => item.id} data={SETTINGS} renderItem={this.gridItem}/>
        {/* <Button title="Debug" onPress={() => {console.log(this.state)}}/> */}
        <BLERead characteristic={this.state.characteristic}/>
      </ScrollView>
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