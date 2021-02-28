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
import InitAllowAppList from "../data/InitAllowAppList";

// TODO: Stuck - 1. How to get Settings info? 2. Can I get all settings info in 1 go?
// TODO: Time/Date Settings
// Skipping 语音及电话接听设置, 信息文字显示排版方式设置

const INIT_VALUES = {
  displayTimeOut: 0,
  language: "1",
  bluetoothName: "(NO NAME)",
  msgDispTime: 0,
  timedate: new Date()
};

class SettingsScreen extends React.Component { 
  constructor({props, route}) {
    super();
    this.state = {
      displayTimeOut: null,
      doNotDisturb: null,
      language: null,
      appEnable: null,
      msgDispTime: null,
      bluetoothName: null,
      audioLoudness: null,
      vMsgHeader: "A0", // Hardcoded
      vMsgPAttri: "05", // Hardcoded
      vMsgSAttri2: "00", // Hardcoded
      characteristic: route.params.characteristic,
      timedate: new Date(),
      showTimeDate: false,
      timedateMode: "date", // "date" or "time"
      allowAppList: [
        {title: "com.whatsapp", toggle: false},
        {title: "com.facebook.orca", toggle: false},
        {title: "com.google.android.talk", toggle: false},
        {title: "com.google.android.calendar", toggle: false},
        {title: "com.tencent.mm", toggle: false}
      ],   // TODO: fetch from InitAllowAPpList, save in persistence storage and fetch accordingly.
    };
    this.setSpinner = route.params.setSpinner;
    this.setSoftAppFilter = route.params.setSoftAppFilter;
    setTimeout(() => {
      this.fetchSettingsInfo();
    }, 100);
  };

  fetchSettingsInfo = async () => {
    console.log("Fetching Settings information from AsyncStorage");

    Storage.fetchInt('@displayTimeOut')
      .then((v) => this.setState({'displayTimeOut': v == null ? INIT_VALUES.displayTimeOut : v}));

    Storage.fetchInt('@msgDispTime')
      .then((v) => this.setState({'msgDispTime': v == null ? INIT_VALUES.msgDispTime : v}));

    Storage.fetchText('@language')
      .then((v) => this.setState({'language': v == null ? INIT_VALUES.language : v}));

    Storage.fetchText('@bluetoothName')
      .then((v) => this.setState({'bluetoothName': v == null ? INIT_VALUES.bluetoothName : v}));

    Storage.fetchText('@timedate')
      .then((v) => this.setState({'timedate': v == null ? INIT_VALUES.timedate : v}));

    // const doNotDisturbPromise = Storage.fetchText('@doNotDisturb');
    // doNotDisturbPromise.then((v) => this.setState({'doNotDisturb': v}));

    // const appEnablePromise = Storage.fetchText('@appEnable');
    // appEnablePromise.then((v) => this.setState({'appEnable': v}));

    // const audioLoudnessPromise = Storage.fetchText('@audioLoudness');
    // audioLoudnessPromise.then((v) => this.setState({'audioLoudness': v == null ? INIT_VALUES.audioLoudness : v}));
  }

  updateState = (item, text) => {
    this.setState({[item.id]: text});
  }

  sendLanguageAndSave = (item, content) => {
    this.updateState(item, content);
    this.send(item, BLEUtils.numStrToHex(content)); // language is a number. 1 = chinese, 2 = english
    Storage.saveText("@" + item.id, content);
  }

  sendTextAndSave = (item, content) => {
    this.send(item, BLEUtils.utf8ToUtf16Hex(content))
    Storage.saveText("@" + item.id, content);
  }

  sendNumberAndSave = (item, content) => {
    this.send(item, BLEUtils.numStrToHex(content));
    Storage.saveInt("@" + item.id, content);
  }

  sendDateTime = (td) => {
    const hourHex = td.getHours().toString(16).padStart(2, '0');;
    const minHex = td.getMinutes().toString(16).padStart(2, '0');
    const secHex = td.getSeconds().toString(16).padStart(2, '0');
    const yrHex = td.getFullYear().toString(16).padStart(4, '0');
    const month = td.getMonth()+1;
    const monthHex = month.toString(16).padStart(2, '0');
    const dayHex = td.getDate().toString(16).padStart(2, '0');

    if(GlobalSettings.DEBUG){
      console.log("Time = ");
      console.log(td);
      console.log("sendDateTime | hex | h = " + hourHex + ", m = " + minHex + ", s = " + secHex + ", yr = " + yrHex + ", month = " + monthHex + ", day = " + dayHex);
    }

    const contentHexStr = hourHex + minHex + secHex + yrHex + monthHex + dayHex;

    this.send({
      id: "timeDate",
      title: "时间日期设置（Time/Date Settings）",
      type: SettingsType.timedate,
      sAttri1HexStr: "51" // HARDCODED
    }, contentHexStr)
  };

  send = (item, contentHexStr) => {
    this.setSpinner(true);
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

    const SuccessWriteFn = () => {
      console.log('成功写入特征值, 现在点击读取特征值看看吧...');
      // ToastAndroid.show('成功写入特征值, 现在点击读取特征值看看吧...', ToastAndroid.SHORT);
      this.setSpinner(false);
    };

    const ErrWriteFn = (err) => {
      console.log('写入特征值出错：', err);
      // ToastAndroid.show("ERROR: " + err, ToastAndroid.SHORT);
      this.setSpinner(false);
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
            value={this.state[itemData.item.id] !== null ? this.state[itemData.item.id].toString() : null}
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
    const AllowAppList = this.state.allowAppList;

    return (
      <ScrollView>
        <FlatList keyExtractor={(item, index) => item.id} data={SettingsData} renderItem={this.gridItem}/>
        <View>
          <View style={styles.lineStyle}/>
          <Text>时间日期设置（Time/Date Settings)</Text>
          <Text>{Moment(this.state.timedate).format('LLL')}</Text>
          <View style={styles.Button}>
            <Button title="更改时间（Modify Time）" onPress={() => this.changeTimeDate("time")}/>
          </View>
          <View style={styles.Button}>
            <Button title="更改日期（Modify Date）" onPress={() => this.changeTimeDate("date")}/>
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

        <View>
          <View style={styles.lineStyle}/>
          <Text>Set Notification Allow App List</Text>
          {AllowAppList.map((item, idx) => (
            <View>
              <Text>{item.title}: {item.toggle ? "on": "off"}</Text>
              <Button title="on" onPress={() => {
                const newAllowAppList = this.state.allowAppList;
                newAllowAppList[idx].toggle = true;
                this.setState({
                  allowAppList: newAllowAppList,
                });
              }}/>
              <Button title="off" onPress={() => {
                const newAllowAppList = this.state.allowAppList;
                newAllowAppList[idx].toggle = false;
                this.setState({
                  allowAppList: newAllowAppList,
                });
              }}/>
            </View>
          ))}
          <Button title="Update" onPress={() => {
            const lst = [];
            this.state.allowAppList.map((item, idx) => {
              if(item.toggle == true){
                lst.push(item.title);
              }
            });
            this.setSoftAppFilter(lst);
            console.log("setSoftAppFilter");
            console.log(lst);
          }}/>
        </View>
        <BLERead characteristic={this.state.characteristic} setSpinner={this.setSpinner}/>
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