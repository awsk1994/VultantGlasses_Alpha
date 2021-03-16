import React from "react";
import { ScrollView, Image, Platform, View, Text, Button, TouchableOpacity } from 'react-native';
import Storage from "../class/Storage";
import SettingsData from "../data/SettingsData";
import Styles from "../class/Styles";
import VButton from "../components/VButton";

// TODO: Stuck - 1. How to get Settings info? 2. Can I get all settings info in 1 go?
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

    Storage.fetchText('@displayTimeOut')
      .then((v) => this.setState({'displayTimeOut': v == null ? INIT_VALUES.displayTimeOut : v}));

    Storage.fetchText('@msgDispTime')
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

  TopNav = () => {
    const topBarHeight = 75;
    return (
      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        <TouchableOpacity style={[Styles.BLEfuncButton, {height: topBarHeight, flex: 1, flexDirection: 'row'}]} onPress={() => this.props.navigation.goBack()}>
          <Text style={Styles.notes_h1}>{'<'} General Settings</Text>
        </TouchableOpacity>
      </View>
    )
  }

  SettingsItemButton = (itemData, color) => {
    return (
      <View style={[Styles.BLEfuncButton]}>
        <VButton text={itemData.title} color={color} onPress={() => {
          this.props.navigation.navigate("SettingsItemScreen", {
            itemData: itemData,
            itemVal: this.state[itemData.id],
            characteristic: this.state.characteristic,
            setSpinner: this.setSpinner,
            setParentState: this.setParentState
          });
        }}/>
      </View>
    )
  }

  EmptyItemButton = (color) => {
    return (
      <View style={[Styles.BLEfuncButton]}>
        <VButton text="" color={color}/>
      </View>
    )
  }

  AllowAppNotificationComponent = () => {
    return (
      <View style={[Styles.BLEfuncButton]}>
        <VButton text="Notification Allow App List" color="green" onPress = {() => {
          this.props.navigation.navigate("NotificationAllowAppListScreen", {
            setAllowAppList: this.setAllowAppList
          });
        }}/>
      </View>
    )
  }

  CustomNotificationTestComponent = () => {
    return (
      <View style={[Styles.BLEfuncButton]}>
        <VButton text="Custom Notification Test" color="lightBlue" onPress={() => {
            this.props.navigation.navigate("Notification", {
              characteristic: this.state.characteristic,
              setSpinner:  this.setSpinner
            });
          }}/>
      </View>
    )
  }

  DisconnectComponent = () => {
    return (
      <View style={[Styles.BLEfuncButton]}>
        <VButton text="Disconnect Device" color="lightBlue" onPress={() => {
          this.disconnectDevice();
          this.props.navigation.goBack();
        }}/>
      </View>
    )
  }

  ReadCharacteristicComponent = () => {
    return (
      <View style={[Styles.BLEfuncButton]}>
        <TouchableOpacity style={Styles.BLEfuncButton}>
            <Image resizeMode='contain' style={Styles.vultantButton}/>
        </TouchableOpacity>
      </View>
    )
  }

  SettingsList = () => {
    return (
      <View>
        <View style={[Styles.flexRow, {flexWrap: 'wrap'}]}>
          {this.AllowAppNotificationComponent()}
          {this.SettingsItemButton(SettingsData.msgDispTime, "lightBlue")}
        </View>
        <View style={[Styles.flexRow, {flexWrap: 'wrap'}]}>
          {this.SettingsItemButton(SettingsData.displayTimeOut, "lightBlue")}
          {this.SettingsItemButton(SettingsData.timedate, "lightBlue")}
        </View>
        <View style={[Styles.flexRow, {flexWrap: 'wrap'}]}>
          {/* {this.SettingsItemButton(SettingsData.bluetoothName, "lightBlue")} */}
          {this.SettingsItemButton(SettingsData.language, "lightBlue")}
          {this.EmptyItemButton("empty")}
        </View>
        <View style={Styles.lightLineStyle}/>
        <Text style={Styles.p}>Advanced Settings</Text>
        <View style={[Styles.flexRow, {flexWrap: 'wrap'}]}>
          {this.CustomNotificationTestComponent()}
          {this.DisconnectComponent()}
        </View>
        <View style={[Styles.flexRow, {flexWrap: 'wrap'}]}>
          {this.ReadCharacteristicComponent()}
        </View>
      </View>
    )
  };

  render() {
    return (
      <ScrollView style={[Styles.basicBg]}>
        {this.TopNav()}
        <View style={{flex: 1}}>{this.SettingsList()}</View>
      </ScrollView>
    );
  }
}

export default SettingsScreen;