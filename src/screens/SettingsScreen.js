import React from "react";
import { Image, Platform, TouchableHighlight, View, Text, Button, TouchableOpacity } from 'react-native';
import Storage from "../class/Storage";
import BLEUtils from "../class/BLEUtils";
import BLERead from "../components/BLERead";
import SettingsData from "../data/SettingsData";
import SettingsType from "../data/SettingsType";
import GlobalSettings from '../data/GlobalSettings';
import DateTimePicker from '@react-native-community/datetimepicker';
import Styles from "../class/Styles";

// TODO: Stuck - 1. How to get Settings info? 2. Can I get all settings info in 1 go?
// TODO: Time/Date Settings
// Skipping 语音及电话接听设置, 信息文字显示排版方式设置

const INIT_VALUES = {
  displayTimeOut: 0,
  language: "1",
  bluetoothName: "(NO NAME)",
  msgDispTime: 0,
  timedate: new Date()
};

class SettingsScreen extends React.Component { 
  constructor({props, route}) {
    super();
    this.state = {
      // doNotDisturb: null,
      // appEnable: null,
      // audioLoudness: null,
      displayTimeOut: null,
      language: null,
      msgDispTime: null,
      bluetoothName: null,
      timedate: new Date(),

      characteristic: route.params.characteristic,
    };

    this.setSpinner = route.params.setSpinner;
    this.disconnectDevice = route.params.disconnectDevice;
    if(Platform.OS === 'android'){
      this.setAllowAppList = route.params.setAllowAppList;
    };
    setTimeout(() => {
      this.fetchSettingsInfo();
    }, 100);
  };

  fetchSettingsInfo = async () => {
    console.log("Fetching Settings information from AsyncStorage");

    Storage.fetchInt('@displayTimeOut')
      .then((v) => this.setState({'displayTimeOut': v == null ? INIT_VALUES.displayTimeOut : v}));

    Storage.fetchInt('@msgDispTime')
      .then((v) => this.setState({'msgDispTime': v == null ? INIT_VALUES.msgDispTime : v}));

    Storage.fetchText('@language')
      .then((v) => this.setState({'language': v == null ? INIT_VALUES.language : v}));

    Storage.fetchText('@bluetoothName')
      .then((v) => this.setState({'bluetoothName': v == null ? INIT_VALUES.bluetoothName : v}));

    Storage.fetchText('@timedate')
      .then((v) => this.setState({'timedate': v == null ? INIT_VALUES.timedate : v}));

    // const doNotDisturbPromise = Storage.fetchText('@doNotDisturb');
    // doNotDisturbPromise.then((v) => this.setState({'doNotDisturb': v}));

    // const appEnablePromise = Storage.fetchText('@appEnable');
    // appEnablePromise.then((v) => this.setState({'appEnable': v}));

    // const audioLoudnessPromise = Storage.fetchText('@audioLoudness');
    // audioLoudnessPromise.then((v) => this.setState({'audioLoudness': v == null ? INIT_VALUES.audioLoudness : v}));
  }

  setParentState = (key, val) => {
    console.log("this parent state. key = " + key + ", val = " + val);
    this.setState({[key]: val});
  };

  topNav = () => {
    const topBarHeight = 75;
    return (
      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        <TouchableOpacity style={[Styles.BLEfuncButton, {height: topBarHeight, flex: 1, flexDirection: 'row'}]} onPress={() => this.props.navigation.goBack()}>
          <Text style={Styles.notes_h1}>{'<'} General Settings</Text>
        </TouchableOpacity>
      </View>
    )
  }

  settingsList = () => {
    return (
      <View>
        <View style={[Styles.flexRow, {flexWrap: 'wrap'}]}>
          <View style={[Styles.BLEfuncButton]}>
            <TouchableOpacity style={Styles.BLEfuncButton} onPress = {() => {
              this.props.navigation.navigate("NotificationAllowAppListScreen", {
                setAllowAppList: this.setAllowAppList
              });
            }}>
              <Image resizeMode='contain' style={Styles.vultantButton} source={require("../img/demo_settings_notification.png")}/>
            </TouchableOpacity>
          </View>
          <View style={[Styles.BLEfuncButton]}>
            <TouchableOpacity style={Styles.BLEfuncButton} onPress = {() => {
              this.props.navigation.navigate("SettingsItemScreen", {
                itemData: SettingsData[3],
                itemVal: this.state[SettingsData[3].id],
                characteristic: this.state.characteristic,
                setSpinner: this.setSpinner,
                setParentState: this.setParentState
              });
            }}>
              <Image resizeMode='contain' style={Styles.vultantButton} source={require("../img/demo_settings_display.png")}/>
            </TouchableOpacity>
          </View>
        </View>
        <View style={[Styles.flexRow, {flexWrap: 'wrap'}]}>
          <View style={[Styles.BLEfuncButton]}>
            <TouchableOpacity style={Styles.BLEfuncButton} onPress = {() => {
              this.props.navigation.navigate("SettingsItemScreen", {
                itemData: SettingsData[2],
                itemVal: this.state[SettingsData[2].id],
                characteristic: this.state.characteristic,
                setSpinner: this.setSpinner,
                setParentState: this.setParentState
              });
            }}>
              <Image resizeMode='contain' style={Styles.vultantButton} source={require("../img/demo_settings_bluetooth.png")}/>
            </TouchableOpacity>
          </View>
          <View style={[Styles.BLEfuncButton]}>
            <TouchableOpacity style={Styles.BLEfuncButton} onPress = {() => {
              this.props.navigation.navigate("SettingsItemScreen", {
                itemData: SettingsData[1],
                itemVal: this.state[SettingsData[1].id],
                characteristic: this.state.characteristic,
                setSpinner: this.setSpinner,
                setParentState: this.setParentState
              });
            }}>
                <Image resizeMode='contain' style={Styles.vultantButton} source={require("../img/demo_settings_lang.png")}/>
            </TouchableOpacity>
          </View>
        </View>
        <View style={[Styles.flexRow, {flexWrap: 'wrap'}]}>
          <View style={[Styles.BLEfuncButton]}>
            <TouchableOpacity style={Styles.BLEfuncButton} onPress = {() => {
              this.props.navigation.navigate("SettingsItemScreen", {
                itemData: SettingsData[0],
                itemVal: this.state[SettingsData[0].id],
                characteristic: this.state.characteristic,
                setSpinner: this.setSpinner,
                setParentState: this.setParentState
              });
            }}>
              <Image resizeMode='contain' style={Styles.vultantButton} source={require("../img/demo_settings_sleeptime.png")}/>
            </TouchableOpacity>
          </View>
          <View style={[Styles.BLEfuncButton]}>
            <TouchableOpacity style={Styles.BLEfuncButton} onPress = {() => {
              this.props.navigation.navigate("SettingsItemScreen", {
                itemData: SettingsData[4],
                itemVal: this.state[SettingsData[4].id],
                characteristic: this.state.characteristic,
                setSpinner: this.setSpinner,
                setParentState: this.setParentState
              });
            }}>
                <Image resizeMode='contain' style={Styles.vultantButton} source={require("../img/demo_settings_timedate.png")}/>
            </TouchableOpacity>
          </View>
        </View>
        <View style={Styles.lightLineStyle}/>
        <View style={[Styles.flexRow, {flexWrap: 'wrap'}]}>
          <View style={[Styles.BLEfuncButton]}>
            <TouchableOpacity style={Styles.BLEfuncButton} onPress={() => {
                this.props.navigation.navigate("Notification", {
                  characteristic: this.state.characteristic,
                  setSpinner:  this.setSpinner
                });
              }}>
                <Image resizeMode='contain' style={Styles.vultantButton} source={require("../img/demo_settings_notification_test.png")}/>
            </TouchableOpacity>
          </View>
          <View style={[Styles.BLEfuncButton]}>
            <TouchableOpacity style={Styles.BLEfuncButton} onPress={() => {
              this.disconnectDevice();
              this.props.navigation.goBack();
            }}>
              <Image resizeMode='contain' style={Styles.vultantButton} source={require("../img/demo_settings_disconnect.png")}/>
            </TouchableOpacity>
          </View>
        </View>
        <View style={[Styles.flexRow, {flexWrap: 'wrap'}]}>
          <View style={[Styles.BLEfuncButton]}>
            <TouchableOpacity style={Styles.BLEfuncButton}>
                <Image resizeMode='contain' style={Styles.vultantButton} source={require("../img/demo_settings_read_characteristics.png")}/>
            </TouchableOpacity>
          </View>
          {/* <View style={[Styles.BLEfuncButton]}>
            <TouchableOpacity style={Styles.BLEfuncButton} onPress={() => {
              this.disconnectDevice();
              this.props.navigation.goBack();
            }}>
              <Image resizeMode='contain' style={Styles.vultantButton} source={require("../img/demo_settings_disconnect.png")}/>
            </TouchableOpacity>
          </View> */}
        </View>
      </View>
    )
  };

  render() {
    return (
      <View style={[Styles.basicBg]}>
        {this.topNav()}
        <View style={{flex: 1}}>{this.settingsList()}</View>
      </View>
    );
  }
}

export default SettingsScreen;