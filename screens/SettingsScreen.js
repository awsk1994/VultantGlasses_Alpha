import React from "react";
import { TextInput, Alert, StyleSheet, View, Text, Button, FlatList, ToastAndroid, ScrollView, TouchableOpacity } from 'react-native';
import Storage from "../components/Storage";
import BLEUtils from "../components/BLEUtils";
import BLERead from "../components/BLERead";
import SettingsData from "../components/SettingsData";
import SettingsType from "../components/SettingsType";
import GlobalSettings from "../components/GlobalSettings";
import DateTimePicker from '@react-native-community/datetimepicker';
import Moment from 'moment';

// TODO: Stuck - 1. How to get Settings info? 2. Can I get all settings info in 1 go?
// TODO: Time/Date Settings
// Skipping 语音及电话接听设置, 信息文字显示排版方式设置

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
      characteristic: route.params.characteristic,
      timedate: new Date(),
      showTimeDate: false,
      timedateMode: "date" // "date" or "time"
    };
    setTimeout(() => {
      this.fetchSettingsInfo();
    }, 100);
  };

  fetchSettingsInfo = async () => {
    console.log("Fetching Settings information from AsyncStorage");
    // TODO: change this to save object instead of text.

    const displayTimeOutPromise = Storage.fetchText('@displayTimeOut');
    displayTimeOutPromise.then((v) => this.setState({'displayTimeOut': v}));

    // const doNotDisturbPromise = Storage.fetchText('@doNotDisturb');
    // doNotDisturbPromise.then((v) => this.setState({'doNotDisturb': v}));

    const languagePromise = Storage.fetchText('@language');
    languagePromise.then((v) => this.setState({'language': v}));

    // const appEnablePromise = Storage.fetchText('@appEnable');
    // appEnablePromise.then((v) => this.setState({'appEnable': v}));

    const bluetoothNamePromise = Storage.fetchText('@bluetoothName');
    bluetoothNamePromise.then((v) => this.setState({'bluetoothName': v}));

    const audioLoudnessPromise = Storage.fetchText('@audioLoudness');
    audioLoudnessPromise.then((v) => this.setState({'audioLoudness': v}));
  }

  updateState = (item, text) => {
    this.setState({[item.id]: text});
  }

  sendLanguageAndSave = (item, text) => {
    this.updateState(item, text);
    this.send(item, BLEUtils.numStrToHex(content)); // language is a number. 1 = chinese, 2 = english
    Storage.saveText("@" + item.id, text);
  }

  sendTextAndSave = (item, content) => {
    this.send(item, BLEUtils.utf8ToUtf16Hex(content))
    Storage.saveText("@" + item.id, content);
  }

  sendNumberAndSave = (item, content) => {
    this.send(item, BLEUtils.numStrToHex(content));
    Storage.saveText("@" + item.id, content);
  }

  sendDateTime = (td) => {
    console.log(td);
    const hour = td.getHours();
    const min = td.getMinutes();
    const sec = td.getSeconds();
    const yr = td.getFullYear();
    const month = td.getMonth();
    const day = td.getDay();

    console.log("h = " + hour + ", m = " + min + ", s = " + sec + ", yr = " + yr + ", month = " + month + ", day = " + day);
    
    // Convert to hex, and send
  }

  send = (item, contentHexStr) => {
    const hexMsgWithoutCRC = this.state.vMsgHeader 
    + this.state.vMsgPAttri 
    + item.sAttri1HexStr
    + this.state.vMsgSAttri2
    + contentHexStr;
    const CRCHex = BLEUtils.sumHex(hexMsgWithoutCRC);
    const hexMsg = hexMsgWithoutCRC + CRCHex;

    if(GlobalSettings.DEBUG){
      console.log("sendAndSave | sAttri1 = " + item.sAttri1HexStr
      + ", id = " + item.id + ", contentHexStr = " + contentHexStr);  // TODO
      console.log("onPressWriteCharacteristic | hexMsg with CRC | " + hexMsg);
    }

    SuccessWriteFn = () => {
      Alert.alert('成功写入特征值', '现在点击读取特征值看看吧...');
    };

    ErrWriteFn = (err) => {
      console.log('写入特征值出错：', err)
      ToastAndroid.show("ERROR: " + err, ToastAndroid.SHORT);
    }

    BLEUtils.writeHexOp(hexMsg, this.state.characteristic, SuccessWriteFn, ErrWriteFn);
  };

  changeTimeDate = (mode) => {
    this.setState({
      showTimeDate: true,
      timedateMode: mode
    });
  };

  onChangeTimeDate = (event, selectedTimeDate) => {
    this.setState({showTimeDate: false});

    if(event.type == "set" && selectedTimeDate != null){  // event type can be "dismissed" or "set"
      console.log("onChangeTimeDate: " + selectedTimeDate);
      this.setState({timedate: selectedTimeDate});
    };
  };

  gridItem = (itemData) => {
    return (
      <View>
        <View style={styles.lineStyle}/>
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
          <Button title="选择中文（Chinese）并发送" onPress={() => this.sendLanguageAndSave(itemData.item, "1")}/>
          <Button title="选择英文（English）并发送" onPress={() => this.sendLanguageAndSave(itemData.item, "2")}/>
        </View>}
      </View>
    )
  }

  render() {
    return (
      <ScrollView>
        <FlatList keyExtractor={(item, index) => item.id} data={SettingsData} renderItem={this.gridItem}/>
        <View>
          <Text>时间日期设置（Time/Date Settings)</Text>
          <Text>{Moment(this.state.timedate).format('LLL')}</Text>
          <View style={styles.Button}>
            <Button title="Modify Time" onPress={() => this.changeTimeDate("time")}/>
          </View>
          <View style={styles.Button}>
            <Button title="Modify Date" onPress={() => this.changeTimeDate("date")}/>
          </View>
          <View style={styles.Button}>
            <Button title="写特征/发送（Send）" onPress={() => this.sendDateTime(this.state.timedate)}/>
          </View>
          {this.state.showTimeDate && (
            <DateTimePicker
              testID="dateTimePicker"
              value={this.state.timedate}
              mode={this.state.timedateMode}
              is24Hour={true}
              display="default"
              onChange={this.onChangeTimeDate}
            />
          )}
        </View>

        <BLERead characteristic={this.state.characteristic}/>
        
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  Button: {
    margin: 10
  },
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