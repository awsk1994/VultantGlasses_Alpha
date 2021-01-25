import React from 'react';
import { ScrollView, View, Text, TextInput, Button, StyleSheet, ToastAndroid, Alert } from 'react-native';
import BLEUtils from "../components/BLEUtils";
import { Buffer } from 'buffer/'

function strToFormatMsgJSX(inpt){
  let strInpt = BLEUtils.strToHex(inpt);
  let msg = BLEUtils.hexToFormatMsgJSX(strInpt);

  if(msg == null){
    return <Text>ERR</Text>;
  }
  
  return (
    <View>
      <Text>帆头: {msg.header}</Text>
      <Text>主属性: {msg.pAttri}</Text>
      <Text>次属性1: {msg.sAttri1}</Text>
      <Text>次属性2: {msg.sAttri2}</Text>
      <Text>内容: {msg.content}</Text>
      <Text>CRC: {msg.CRC}</Text>
    </View>
  );
}

class NotificationScreen extends React.Component {
  constructor({props, route}) {
    super(props);
    this.state = {
      appName: "",
      contact: "",
      content: "",
      vMsgHeader: "00",
      vMsgPAttri: "00",
      vMsgSAttri1: "00",
      vMsgSAttri2: "00",
      vMsgContent: "00",
      characteristic: route.params.characteristic,
      readVal: ""
    };
  };

  onPressWriteCharacteristic(){
    // "00" temp divider
    const content = this.state.appName + "00" + this.state.contact + "00" + this.state.content;
    const hexMsg = this.state.vMsgHeader 
    + this.state.vMsgPAttri 
    + this.state.vMsgSAttri1
    + this.state.vMsgSAttri2
    + content;

    const CRCHex = BLEUtils.sumHex(hexMsg);
    console.log("write hexStr | " + (hexMsg + CRCHex));
    this.writeHexOp(hexMsg + CRCHex);
  }

  writeHexOp = (hexStr) => {
    if (!hexStr) {
      Alert.alert('请输入要写入的特征值')
    }
    const hexMsg = Buffer.from(hexStr, 'hex').toString('base64')
    ToastAndroid.show('开始写入特征值：' + hexMsg, ToastAndroid.SHORT);

    this.state.characteristic.writeWithResponse(hexMsg)
      .then(() => {
        Alert.alert('成功写入特征值', '现在点击读取特征值看看吧...')
      })
      .catch(err => {
        console.log('写入特征值出错：', err)
        ToastAndroid.show("ERROR: " + err, ToastAndroid.SHORT);
      })
  };

  onPressRead = async() => {
    console.log("onPressRead");
    try{
      let char = await this.state.characteristic.read();
      console.log("Characteristics Read Value: " + char.value);
      ToastAndroid.show("Characteristics Read Value: " + char.value, ToastAndroid.SHORT);
      this.setState({readValue: char.value});
    } catch(err){
      console.log("ERROR:");
      console.log(err);
      ToastAndroid.show("ERROR: " + err, ToastAndroid.SHORT);
    }
  };

  render() {
    return (
      <ScrollView style={{margin: 10}}>
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
        <Button title="Write Characteristic" onPress = {() => {
          this.onPressWriteCharacteristic();
        }}/>
        <Text>============</Text>
        <Button title="Read Characteristic" onPress = {() => {
          this.onPressRead()
        }}/>
        {strToFormatMsgJSX(this.state.readValue)}
      </ScrollView>
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