import React from 'react';
import { ScrollView, View, Text, TextInput, Button, StyleSheet, ToastAndroid, Alert } from 'react-native';
import BLEUtils from "../components/BLEUtils";
import BLERead from "../components/BLERead";

// TODO: Debug 内容 into the 3 parts (app name, contact, content)
// TODO: too many console.log. Remove some.
// TODO: Implement constants.js to store CONSTANTS.

class NotificationScreen extends React.Component {
  constructor({props, route}) {
    super(props);
    this.state = {
      appName: "",
      contact: "",
      content: "",
      vMsgHeader: "A0", // Hardcoded
      vMsgPAttri: "02", // Hardcoded
      vMsgSAttri1: "23", // Hardcoded
      vMsgSAttri2: "00", // Hardcoded
      characteristic: route.params.characteristic,
      readVal: ""
    };
  };

  onPressWriteCharacteristic(){
    console.log("onPressWriteCharacteristic | Input utf8 | appName = " + this.state.appName 
      + ", contact = " + this.state.contact
      + ", content = " + this.state.content);
    
    const divider = "00";    
    const appNameHex = BLEUtils.utf8ToHex(this.state.appName);
    const contactHex = BLEUtils.utf8ToHex(this.state.contact);
    const contentHex = BLEUtils.utf8ToHex(this.state.content);

    console.log("onPressWriteCharacteristic | utf8 to hex | appName = " + appNameHex 
      + ", contact = " + contactHex
      + ", content = " + contentHex);
    
    console.log("onPressWriteCharacteristic | getSize | appName = " + BLEUtils.getHexSize(appNameHex) 
      + ", contact = " + BLEUtils.getHexSize(contactHex)
      + ", content = " + BLEUtils.getHexSize(contentHex));

    const entireContentHex = BLEUtils.getHexSize(appNameHex) + appNameHex + divider
    + BLEUtils.getHexSize(contactHex) + contactHex + divider 
    + BLEUtils.getHexSize(contentHex) + contentHex;

    console.log("onPressWriteCharacteristic | entireContentHex | " + entireContentHex);

    const hexMsg = this.state.vMsgHeader 
    + this.state.vMsgPAttri 
    + this.state.vMsgSAttri1
    + this.state.vMsgSAttri2
    + entireContentHex;

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
  }

  render() {
    return (
      <ScrollView style={{margin: 10}}>
        {/* <Text>NotificationScreen</Text> */}
        <TextInput
            placeholder="APP名称（App Name）"
            value={this.state.appName}
            onChangeText={v => this.setState({"appName": v})}
          />
        <TextInput
            placeholder="联络人（Contact）"
            value={this.state.contact}
            onChangeText={v => this.setState({"contact": v})}
          />
        <TextInput
            placeholder="内容（Content）"
            value={this.state.content}
            onChangeText={v => this.setState({"content": v})}
          />
        <Button title="写特征（Write Characteristic）" onPress = {() => {
          this.onPressWriteCharacteristic();
        }}/>
        <BLERead characteristic={this.state.characteristic}/>
      </ScrollView>
    )
  };
}

// TODO: generate styles
const styles = StyleSheet.create({
  "button": {
    margin: 10
  },
  lineStyle:{
      borderWidth: 0.5,
      borderColor:'black',
      margin:10,
  },
  h1: {
    fontSize: 20,
    fontWeight: "bold"
  },
  h2: {
    fontSize: 15,
    fontWeight: "bold"
  }
})

export default NotificationScreen;