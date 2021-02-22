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

class BLERead extends React.Component { 
  constructor(props) {
    super();
    this.state = {
      readValue: null,
      show: false
    }
  };

  onPressReadOp = async() => {
    this.props.setSpinner(true);
    console.log("onPressReadOp");
    try{
      let char = await this.props.characteristic.read();
      console.log("Characteristics Read Value: " + char.value);
      // ToastAndroid.show("Characteristics Read Value: " + char.value, ToastAndroid.SHORT);
      this.setState({readValue: char.value});
      this.props.setSpinner(false);
    } catch(err){
      console.log("ERROR:");
      console.log(err);
      ToastAndroid.show("ERROR: " + err, ToastAndroid.SHORT);
      this.props.setSpinner(false);
    }
  };

  setShow = (val) => {
    this.setState({show: val});
  };

  render() {
    return (
      <View>
        <View style={styles.lineStyle}/>
        {!this.state.show && <Button onPress={() => this.setShow(true)} title="Show BLERead"/>}
        {this.state.show && <View>
          <Button onPress={() => this.setShow(false)} title="Hide BLERead"/>
          <Text style={styles.h2}>READ DEBUG</Text>
          <Text>读取特征值:</Text>
          <View >
            <Button type="primary" style={{ marginTop: 8 }} onPress={this.onPressReadOp} title="读取特征值"/>
          </View>
          {strToFormatMsgJSX(this.state.readValue)}
          <Text>{`十六进制: ${BLEUtils.strToHex(this.state.readValue)}`}</Text>
        </View>}
      </View>
    );
  }
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

export default BLERead;