import React from 'react';
import { View, Text, TextInput, Button, StyleSheet, ToastAndroid, Alert } from 'react-native';
import BLERead from "../components/BLERead";
import BLEUtils from "../components/BLEUtils";
import GlobalSettings from '../components/GlobalSettings';

class CueCardScreen extends React.Component {
  constructor({props, route}) {
    super(props);
    this.state = {
      cuecard: "",
      vMsgHeader: "A0", // Hardcoded
      vMsgPAttri: "01", // Hardcoded
      vMsgSAttri1: "16", // Hardcoded
      vMsgSAttri2: "00", // Hardcoded
      characteristic: route.params.characteristic
    }
  };

  onPressWrite(){
    const cuecardHex = BLEUtils.utf8ToUtf16Hex(this.state.cuecard);
    const hexMsgWithoutCRC = this.state.vMsgHeader 
    + this.state.vMsgPAttri 
    + this.state.vMsgSAttri1
    + this.state.vMsgSAttri2
    + cuecardHex;
    const CRCHex = BLEUtils.sumHex(hexMsgWithoutCRC);
    const hexMsg = hexMsgWithoutCRC + CRCHex;

    if(GlobalSettings.DEBUG){
      console.log("onPressWrite | Input utf8 | cue card = " + this.state.cuecard);
      console.log("onPressWrite | utf8 to hex | cue card = " + cuecardHex);
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
  }

  render() {
    return (
      <View style={{margin: 10}}>
        <View>
          <Text>PPT笔记（Cue Card）:</Text>
          <TextInput
            placeholder="PPT笔记（Cue Card）"
            value={this.state.nocuecardtes}
            onChangeText={v => this.setState({"cuecard": v})}
          />
        </View>
        <Button title="写特征/发送（Send Notes）" onPress = {() => {
          this.onPressWrite();
        }}/>
        <BLERead characteristic={this.state.characteristic}/>
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

export default CueCardScreen;