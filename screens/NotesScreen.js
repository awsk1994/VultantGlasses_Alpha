import React from 'react';
import { View, Text, TextInput, Button, StyleSheet, ToastAndroid, Alert } from 'react-native';
import BLERead from "../components/BLERead";
import BLEUtils from "../components/BLEUtils";

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
    }
  };

  onPressWrite(){
    console.log("onPressWrite | Input utf8 | imgId = " + this.state.imgId 
    + ", notes = " + this.state.notes);
    
    const imgIdHex = BLEUtils.numStrToHex(this.state.imgId);
    const notesHex = BLEUtils.utf8ToHex(this.state.notes);

    console.log("onPressWrite | utf8 to hex | imgId = " + imgIdHex 
    + ", notes = " + notesHex);

    const entireContentHex = imgIdHex + notesHex;
    console.log("onPressWrite | entireContentHex | " + entireContentHex);

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
      <View style={{margin: 10}}>
        <View> 
          <Text>Image ID:</Text>
          <TextInput
            placeholder="Image ID"
            value={this.state.imgId}
            onChangeText={v => this.setState({"imgId": v})}
          />
        </View>
        <View>
          <Text>Notes:</Text>
          <TextInput
            placeholder="Notes"
            value={this.state.notes}
            onChangeText={v => this.setState({"notes": v})}
          />
        </View>
        <Button title="Send Notes" onPress = {() => {
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

export default NotesScreen;