import React from 'react';
import { ScrollView, TouchableOpacity, TextInput, View, Text, Button } from 'react-native';
import Storage from "../class/Storage";
import BLEUtils from "../class/BLEUtils";
import GlobalSettings from '../data/GlobalSettings';
import SettingsType from "../data/SettingsType";
import DateTimePicker from '@react-native-community/datetimepicker';
import Styles from "../class/Styles";
import Moment from 'moment';
import VButton from '../components/VButton';

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
      this.props.navigation.goBack();
    };

    const ErrWriteFn = (err) => {
      console.log('写入特征值出错：', err);
      // ToastAndroid.show("ERROR: " + err, ToastAndroid.SHORT);
      this.setSpinner(false);
    }

    BLEUtils.writeHexOp(hexMsg, this.state.characteristic, SuccessWriteFn, ErrWriteFn);
  };

  // Type Components
  SecondsComponent = () => {
    const onSecChange = (val) => {
      this.setState({itemVal: val});
      this.sendNumberAndSave(this.state.itemData, val);
    };

    const VFillableButton = (val) => {
      if(this.state.itemVal == val){
        return (<VButton text={val + " seconds"} fill={true} color="green" onPress={() => onSecChange(val)}/>)
      } else {
        return (<VButton text={val + " seconds"} color="green" onPress={() => onSecChange(val)}/>)
      }
    }

    return (
      <View>
        <View style={[Styles.flexRow, {flexWrap: 'wrap'}]}>
          {VFillableButton('10')}
          {VFillableButton('30')}
        </View>
        <View style={[Styles.flexRow, {flexWrap: 'wrap'}]}>
          {VFillableButton('60')}
          <VButton text="Custom" color="white" onPress={() => onSecChange(0)}/>
        </View>
      </View>
    )
  }

  TextComponent = () => {
    const title = this.state.itemData.title;
    return (
      <View>
      <View style={[Styles.settingsItem, {backgroundColor: '#43717B', margin: 10}]}>
        <Text style={Styles.notes_h1}>{title}</Text>
        <TextInput
          placeholder="Enter notes here..."
          value={this.state.itemVal}
          style={Styles.blueText}
          onChangeText={(text) => this.setState({itemVal: text})}
        />
      </View>
    </View>
    )
  }

  LangComponent = () => {
    const VFillableButton = (val, text) => {
      if(this.state.itemVal == val){
        return (<VButton text={text} fill={true} color="green" onPress={() => this.sendLanguageAndSave(this.state.itemData, val)}/>)
      } else {
        return (<VButton text={text} color="green" onPress={() => this.sendLanguageAndSave(this.state.itemData, val)}/>)
      }
    }

    return (
      <View>
        <View style={[Styles.flexRow, {flexWrap: 'wrap'}]}>
          {VFillableButton("1", "中文（Chinese)")}
          {VFillableButton("2", "英文（English)")}

          {/* <VButton text="中文（Chinese)" color="green" onPress={() => this.sendLanguageAndSave(this.state.itemData, "1")}/>
          <VButton text="英文（English)" color="green" onPress={() => this.sendLanguageAndSave(this.state.itemData, "2")}/> */}
        </View>
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
  
      this.send(this.state.itemData, contentHexStr);
    };
  
    return (
      <View>
        <View>
          <View style={[Styles.flexRow, {flexWrap: 'wrap'}]}>
            <VButton text="更改时间(modfiy Time)" color="green" onPress={() => changeTimeDate("time")}/>
            <VButton text="更改日期(modify Date)" color="green" onPress={() => changeTimeDate("date")}/>
          </View>
        </View>
        <Text style={Styles.grayText}>{Moment(this.state.timedate).format('LLL')}</Text>
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

  TopNav = (title, type) => {
    const topBarHeight = 75;

    const genericSendAndSave = () => {
      switch(this.state.itemData.type){
        case SettingsType.seconds:
          this.sendNumberAndSave(this.state.itemData, this.state.itemVal);
          break;
        case SettingsType.text:
          this.sendTextAndSave(this.state.itemData, this.state.itemVal);
          break;
        case SettingsType.language:
        case SettingsType.timedate:
          this.props.navigation.goBack();
          break;
        default:
          break;
      };
    };

    return (
      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        <TouchableOpacity 
          style={[Styles.BLEfuncButton, {height: topBarHeight, flex: 1, flexDirection: 'row'}]} 
          onPress={() => genericSendAndSave()}>
          <Text style={Styles.notes_h1}>{'<'} Edit {title}</Text>
        </TouchableOpacity>
      </View>
    )
  }

  SettingsItemComponent = () => {
    return (
      <View>
        {this.state.itemData.type == SettingsType.seconds && this.SecondsComponent()}
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