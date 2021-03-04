import React from 'react';
import { View, Text, TextInput, Button, StyleSheet, ToastAndroid, Alert } from 'react-native';
import BLERead from "../components/BLERead";
import BLEUtils from "../class/BLEUtils";
import GlobalSettings from '../data/GlobalSettings';

class NotesScreen extends React.Component {
  constructor({props, route}) {
    super(props);
    this.state = {
      notes: "",
      imgId: "00",
      vMsgHeader: "A0", // Hardcoded
      vMsgPAttri: "01", // Hardcoded
      vMsgSAttri1: "13", // Hardcoded
      vMsgSAttri2: "00", // Hardcoded
      characteristic: route.params.characteristic
    };
    this.setSpinner = route.params.setSpinner;
  };

  onPressWrite(){    
    this.setSpinner(true);

    const imgIdHex = BLEUtils.numStrToHex(this.state.imgId);
    const notesHex = BLEUtils.utf8ToUtf16Hex(this.state.notes);
    const entireContentHex = imgIdHex + notesHex;

    const hexMsgWithoutCRC = this.state.vMsgHeader 
    + this.state.vMsgPAttri 
    + this.state.vMsgSAttri1
    + this.state.vMsgSAttri2
    + entireContentHex;
    const CRCHex = BLEUtils.sumHex(hexMsgWithoutCRC);
    const hexMsg = hexMsgWithoutCRC + CRCHex;

    if(GlobalSettings.DEBUG){
      console.log("onPressWrite | Input utf8 | imgId = " + this.state.imgId 
      + ", notes = " + this.state.notes);
  
      console.log("onPressWrite | utf8 to hex | imgId = " + imgIdHex 
      + ", notes = " + notesHex);
  
      console.log("onPressWrite | entireContentHex | " + entireContentHex);
  
      console.log("onPressWriteCharacteristic | hexMsg with CRC | " + hexMsg);  
    }

    const SuccessWriteFn = () => {
      console.log('成功写入特征值', '现在点击读取特征值看看吧...');
      // ToastAndroid.show('成功写入特征值, 现在点击读取特征值看看吧...', ToastAndroid.SHORT);
      this.setSpinner(false);   
    };

    const ErrWriteFn = (err) => {
      console.log('写入特征值出错：', err)
      // ToastAndroid.show("ERROR: " + err, ToastAndroid.SHORT);
      this.setSpinner(false);
    }

    BLEUtils.writeHexOp(hexMsg, this.state.characteristic, SuccessWriteFn, ErrWriteFn);
  }

  render() {
    return (
      <View style={{margin: 10}}>
        <View> 
          <Text>图片ID（Image ID）:</Text>
          <TextInput
            placeholder="图片ID（Image ID）"
            value={this.state.imgId}
            onChangeText={v => this.setState({"imgId": v})}
          />
        </View>
        <View>
          <Text>笔记（Notes）:</Text>
          <TextInput
            placeholder="笔记（Notes）"
            value={this.state.notes}
            onChangeText={v => this.setState({"notes": v})}
          />
        </View>
        <Button title="写特征/发送（Send Notes）" onPress = {() => {
          this.onPressWrite();
        }}/>
        <BLERead characteristic={this.state.characteristic} setSpinner={this.setSpinner}/>
      </View>
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
  }
})

export default NotesScreen;