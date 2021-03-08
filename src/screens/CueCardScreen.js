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
      cuecards: [],
      focusedIdx: 0
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

    const content = this.state.cuecards.length > 0 ? this.state.cuecards[this.state.focusedIdx].content : "";
    
    console.log("Content = " + content);

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
        <View style={itemData.index == this.state.focusedIdx ? Styles.redThickBorder : {}}>
          <View style={Styles.lineStyle}/>
          <View style={Styles.settingsItem}>
            <View style={{width: 50}}>
              <Button title="-" onPress={() => delElement(itemData.index)}/>
            </View>
            <Text>Slide {itemData.index + 1}</Text>
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

      if(this.state.cuecards.length == 0){
        this.setState({focusedIdx: 0})
      }

      // 0 1 2 ==> 0 1 
      // focus idx = 2

      else if(this.state.focusedIdx == this.state.cuecards.length){
        this.setState({focusedIdx: this.state.cuecards.length-1})
      }

      else if(this.state.focusedIdx == this.state.cuecards.length){
        this.setState({focusedIdx: this.state.cuecards.length-1})
      }

      setTimeout(() => changeCueCardsParentFnBefore(newLst), 10);
    };

    return (
      <View>
        <View style={{width: 50}}>
          <Button title="+" onPress={() => addElement()}/>
        </View>
        <FlatList keyExtractor={(item, index) => item.id} data={this.state.cuecards} renderItem={listItem}/>
      </View>
    )
  }

  focusNav = () => {
    const changeFocus = (changeVal) => {
      if(this.state.cuecards.length == 0){
        console.log("cuecard length is 0. Ignoring this.");
        return;
      }

      if(this.state.focusedIdx == 0 && changeVal == -1){
        console.log("Out of (lower) bound. Ignoring this.");
        return;
      }

      if(this.state.focusedIdx == this.state.cuecards.length-1 && changeVal == 1){
        console.log("Out of (upper) bound. Ignoring this.");
        return;
      }
      
      const newFocusedIdx = this.state.focusedIdx + changeVal;
      this.setState({focusedIdx: newFocusedIdx});
      console.log("focusNav | focusedIdx = " + this.state.focusedIdx + ", newFocusedIdx = " + newFocusedIdx);
      setTimeout(() => this.onPressWrite(), 10);
    };

    return (
      <View>
        <Text>Focused Idx: {this.state.focusedIdx}</Text>
        <View style={Styles.settingsButtonItem}>
          <View style={{width: 120}}> 
            <Button title="<" onPress={() => changeFocus(-1)}/>
          </View>
          <View style={{width: 120}}>
            <Button title=">" onPress={() => changeFocus(1)}/>
          </View>
        </View>
      </View>
    )
  }

  render() {
    return (
      <ScrollView style={{margin: 10}}>
        {this.focusNav()}
        <View style={Styles.lineStyle}/>
        {this.cuecardList()}
        {/* <BLERead characteristic={this.state.characteristic} setSpinner={this.setSpinner}/> */}
      </ScrollView>
    )
  };
}

export default CueCardScreen;