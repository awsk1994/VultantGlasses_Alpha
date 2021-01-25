import React from "react";
import { TextInput, Alert, StyleSheet, View, Text, Button, FlatList, ToastAndroid, ScrollView, TouchableOpacity } from 'react-native';
import BLEUtils from "./BLEUtils.js";

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

class DemoComponent extends React.Component { 
  constructor(props) {
    super();
    this.state = {
      readValue: null
    }
  };

  onPressReadOp = async() => {
    console.log("onPressReadOp");
    try{
      let char = await this.props.characteristic.read();
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
      <View>
        <Text>=======================================</Text>
        <Text>操作（Operations)</Text>
        <Text>读取特征值:</Text>
        <View >
          <Button type="primary" style={{ marginTop: 8 }} onPress={this.onPressReadOp} title="读取特征值"/>
        </View>
        {strToFormatMsgJSX(this.state.readValue)}
        <Text>{`十六进制: ${BLEUtils.strToHex(this.state.readValue)}`}</Text>
      </View>
    );
  }
}

export default DemoComponent;