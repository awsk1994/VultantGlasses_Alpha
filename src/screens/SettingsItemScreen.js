import React from 'react';
import { TextInput, Platform, TouchableHighlight, Switch, Alert, StyleSheet, View, Text, Button, FlatList, ToastAndroid, ScrollView, TouchableOpacity } from 'react-native';
import Storage from "../class/Storage";
import BLEUtils from "../class/BLEUtils";
import GlobalSettings from '../data/GlobalSettings';
import SettingsType from "../data/SettingsType";

class SettingsItemScreen extends React.Component {
  constructor({props, route}) {
    super(props);
    this.state = {
      vMsgHeader: "A0", // Hardcoded
      vMsgPAttri: "05", // Hardcoded
      vMsgSAttri2: "00", // Hardcoded

      itemData: route.params.itemData,
      itemVal: route.params.itemVal,
      characteristic: route.params.characteristic
    };
    this.setParentState = route.params.setParentState;
    this.setSpinner = route.params.setSpinner;
    // console.log("item:");
    // console.log(this.state.itemData);
    // console.log("itemVal:");
    // console.log(this.state.itemVal);
  };

  sendLanguageAndSave = (itemData, content) => {
    this.setParentState(itemData.id, content);
    this.send(itemData, BLEUtils.numStrToHex(content)); // language is a number. 1 = chinese, 2 = english
    Storage.saveText("@" + itemData.id, content);
  }

  sendTextAndSave = (itemData, content) => {
    this.setParentState(itemData.id, content);
    this.send(itemData, BLEUtils.utf8ToUtf16Hex(content))
    Storage.saveText("@" + itemData.id, content);
  }

  sendNumberAndSave = (itemData, content) => {
    this.setParentState(itemData.id, content);
    this.send(itemData, BLEUtils.numStrToHex(content));
    Storage.saveInt("@" + itemData.id, content);
  }

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

  // Type Components
  NumericComponent = () => {
    return (
      <View>
        <TextInput keyboardType='numeric' 
          onChangeText={(text) => this.setState({itemVal: text})}
          value={this.state.itemVal != null ? this.state.itemVal.toString() : null}
          maxLength={10}  //setting limit of input
        />
        <Button title="写特征/发送（Send）" onPress={() => {this.sendNumberAndSave(this.state.itemData, this.state.itemVal)}}/>
      </View>
    )
  }

  TextComponent = () => {
    <View>
      <TextInput
          onChangeText={(text) => this.setState({itemVal: text})}
          value={this.state.itemVal}
        />
      <Button title="写特征/发送（Send）" onPress={() => {this.sendTextAndSave(this.state.itemData, this.state.itemVal)}}/>
    </View>
  }

  LangComponent = () => {
    <View>
      <Button title="选择中文（Chinese)" onPress={() => this.sendLanguageAndSave(this.state.itemData, "1")}/>
      <Button title="选择英文（English)" onPress={() => this.sendLanguageAndSave(this.state.itemData, "2")}/>
    </View>
  }

  render() {
    return (
      <View>
        <Text>{this.state.itemData.title}</Text>
        {this.state.itemData.type == SettingsType.numeric && this.NumericComponent()}
        {this.state.itemData.type == SettingsType.text && this.TextComponent()}
        {this.state.itemData.type == SettingsType.language && this.LangComponent()}
      </View>
    )
  };
}

export default SettingsItemScreen;  