import React from 'react';
import { FlatList, ScrollView, View, Text, TextInput, Button, StyleSheet, ToastAndroid, Alert } from 'react-native';
import BLERead from "../components/BLERead";
import BLEUtils from "../class/BLEUtils";
import GlobalSettings from '../data/GlobalSettings';
import Storage from '../class/Storage';
import Styles from "../class/Styles";

class CueCardScreen extends React.Component {
  constructor({props, route}) {
    super(props);
    this.state = {
      cuecard: "",
      vMsgHeader: "A0", // Hardcoded
      vMsgPAttri: "01", // Hardcoded
      vMsgSAttri1: "16", // Hardcoded
      vMsgSAttri2: "00", // Hardcoded
      characteristic: route.params.characteristic,
      cuecards: []
    };
    this.setSpinner = route.params.setSpinner;
  };

  componentDidMount() {
    setTimeout(() => this.fetchCueCardsInfo(), 100);
  };
  
  fetchCueCardsInfo = async () => {
    console.log("Fetching cuecards information from AsyncStorage");
    Storage.fetchObjList('@cuecards')
      .then((val) => this.setState({'cuecards': val}));
  }

  onPressWrite(){
    this.setSpinner(true);

    const content = this.state.cuecards.length > 0 ? this.state.cuecards[0].content : "";
    const cuecardHex = BLEUtils.utf8ToUtf16Hex(content);
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

  cuecardList = () => {
    listItem = (itemData) => {
      return (
        <View>
          <View style={Styles.lineStyle}/>
          <View style={Styles.settingsItem}>
            <Button title="-" onPress={() => delElement(itemData.index)}/>
            <Text>Cue Card</Text>
            <TextInput
              placeholder="Enter cue card content here..."
              value={itemData.item.content}
              onChangeText={v => onChangeContent(v, itemData.index)}
            />
          </View>
        </View>
      )
    };

    changeCueCardsParentFnBefore = () => {
      this.setSpinner(true);
    }

    changeCueCardsParentFnBefore = (newLst) => {
      this.setState({cuecards: newLst});
      Storage.saveObjList("@cuecards", this.state.cuecards);
      this.setSpinner(false);
      this.onPressWrite();
    }

    onChangeContent = (v, idx) => {
      changeCueCardsParentFnBefore();
      let newLst = this.state.cuecards;
      newLst[idx].content = v;
      changeCueCardsParentFnBefore(newLst);
    };

    addElement = () => {
      changeCueCardsParentFnBefore();
      let newLst = this.state.cuecards;
      newLst.push({id: this.state.cuecards.length, content: ""});
      changeCueCardsParentFnBefore(newLst);
    };

    delElement = (idx) => {
      changeCueCardsParentFnBefore();
      let newLst = this.state.cuecards;
      newLst.splice(idx, 1);  // change splice method
      changeCueCardsParentFnBefore(newLst);
    };

    return (
      <View>
        <Button title="+" onPress={() => addElement()}/>
        <FlatList keyExtractor={(item, index) => item.id} data={this.state.cuecards} renderItem={listItem}/>
        {/* <BLERead characteristic={this.state.characteristic} setSpinner={this.setSpinner}/> */}
      </View>
    )
  }

  render() {
    return (
      <ScrollView style={{margin: 10}}>
        {/* <View>
          <Text>PPT笔记（Cue Card）:</Text>
          <TextInput
            placeholder="PPT笔记（Cue Card）"
            value={this.state.nocuecardtes}
            onChangeText={v => this.setState({"cuecard": v})}
          />
        </View>
        <Button title="写特征/发送（Send Notes）" onPress = {() => {
          this.onPressWrite();
        }}/> */}
        {this.cuecardList()}
        <BLERead characteristic={this.state.characteristic} setSpinner={this.setSpinner}/>
      </ScrollView>
    )
  };
}

export default CueCardScreen;