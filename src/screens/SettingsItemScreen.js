import React from 'react';
import { ScrollView, TouchableOpacity, TextInput, View, Text, Button } from 'react-native';
import Storage from "../class/Storage";
import BLEUtils from "../class/BLEUtils";
import GlobalSettings from '../data/GlobalSettings';
import SettingsType from "../data/SettingsType";
import DateTimePicker from '@react-native-community/datetimepicker';
import Styles from "../class/Styles";
import Moment from 'moment';

class SettingsItemScreen extends React.Component {
  constructor({props, route}) {
    super(props);
    this.state = {
      vMsgHeader: "A0", // Hardcoded
      vMsgPAttri: "05", // Hardcoded
      vMsgSAttri2: "00", // Hardcoded

      itemData: route.params.itemData,
      itemVal: route.params.itemVal,
      characteristic: route.params.characteristic,

      showTimeDate: false,
      timedateMode: "time"
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
          style={Styles.blueText}
          onChangeText={(text) => this.setState({itemVal: text})}
          value={this.state.itemVal != null ? this.state.itemVal.toString() : null}
          maxLength={10}  //setting limit of input
        />
        <Button style={Styles.BLEfuncButton} title="写特征/发送（Send）" onPress={() => {this.sendNumberAndSave(this.state.itemData, this.state.itemVal)}}/>
      </View>
    )
  }

  TextComponent = () => {
    return (
      <View>
        <TextInput
          style={Styles.blueText}
          onChangeText={(text) => this.setState({itemVal: text})}
          value={this.state.itemVal}
          plaeholder="..."
        />
        <Button style={Styles.BLEfuncButton} title="写特征/发送（Send）" onPress={() => {this.sendTextAndSave(this.state.itemData, this.state.itemVal)}}/>
      </View>
    )
  }

  LangComponent = () => {
    return (
      <View>
        <Button style={Styles.BLEfuncButton} title="选择中文（Chinese)" onPress={() => this.sendLanguageAndSave(this.state.itemData, "1")}/>
        <Button style={Styles.BLEfuncButton} title="选择英文（English)" onPress={() => this.sendLanguageAndSave(this.state.itemData, "2")}/>
      </View>
    )
  }

  TimeDateComponent = () => {
    // TODO: can move state.showTimeDate and timedateMode to here as a variable?

    const changeTimeDate = (mode) => {
      this.setState({
        showTimeDate: true,
        timedateMode: mode
      });
    };
  
    const onChangeTimeDate = (event, selectedTimeDate) => {
      this.setState({showTimeDate: false});
  
      if(event.type == "set" && selectedTimeDate != null){  // event type can be "dismissed" or "set"
        console.log("onChangeTimeDate: " + selectedTimeDate);
        this.setState({itemVal: selectedTimeDate});
        this.setParentState(itemData.id, selectedTimeDate)
      };
      sendDateTime(selectedTimeDate);
      // Storage.saveText("@" + itemData.id, content);  // will not save time
    };

    let sendDateTime = (td) => {
      const hourHex = td.getHours().toString(16).padStart(2, '0');;
      const minHex = td.getMinutes().toString(16).padStart(2, '0');
      const secHex = td.getSeconds().toString(16).padStart(2, '0');
      const yrHex = td.getFullYear().toString(16).padStart(4, '0');
      const month = td.getMonth()+1;
      const monthHex = month.toString(16).padStart(2, '0');
      const dayHex = td.getDate().toString(16).padStart(2, '0');
  
      if(GlobalSettings.DEBUG){
        console.log("Time = ");
        console.log(td);
        console.log("sendDateTime | hex | h = " + hourHex + ", m = " + minHex + ", s = " + secHex + ", yr = " + yrHex + ", month = " + monthHex + ", day = " + dayHex);
      }
  
      const contentHexStr = hourHex + minHex + secHex + yrHex + monthHex + dayHex;
  
      this.send(this.state.itemData, contentHexStr)
    };
  
    return (
      <View>
        <Text style={Styles.grayText}>{Moment(this.state.timedate).format('LLL')}</Text>
        <View>
          <View style={Styles.button}>
            <Button title="更改时间(modfiy Time)" onPress={() => changeTimeDate("time")}/>
          </View>
          <View style={Styles.button}>
            <Button title="更改日期(modify Date)" onPress={() => changeTimeDate("date")}/>
          </View>
        </View>
        <Text style={Styles.grayText}>TimeDate wont' be saved into Persistence; since it keeps changing.</Text>
        
        {this.state.showTimeDate && (
          <DateTimePicker
            testID="dateTimePicker"
            value={this.state.itemVal}
            mode={this.state.timedateMode}
            is24Hour={true}
            display="default"
            onChange={onChangeTimeDate}
          />
        )}
      </View>
    );
  }

  TopNav = (title) => {
    const topBarHeight = 75;
    return (
      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        <TouchableOpacity style={[Styles.BLEfuncButton, {height: topBarHeight, flex: 1, flexDirection: 'row'}]} onPress={() => this.props.navigation.goBack()}>
          <Text style={Styles.notes_h1}>{'<'} Edit {title}</Text>
        </TouchableOpacity>
      </View>
    )
  }

  SettingsItemComponent = () => {
    return (
      <View>
        {this.state.itemData.type == SettingsType.numeric && this.NumericComponent()}
        {this.state.itemData.type == SettingsType.text && this.TextComponent()}
        {this.state.itemData.type == SettingsType.language && this.LangComponent()}
        {this.state.itemData.type == SettingsType.timedate && this.TimeDateComponent()}
      </View>
    )
  }

  render() {
    return (
      <ScrollView style={[Styles.basicBg]}>
      {this.TopNav(this.state.itemData.id)}
      <View style={{flex: 1}}>
        {this.SettingsItemComponent()}
      </View>
    </ScrollView>
    )
  };
}

export default SettingsItemScreen;  