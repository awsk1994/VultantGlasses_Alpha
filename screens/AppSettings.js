import React from "react";
import { TextInput, Alert, StyleSheet, View, Text, Button, FlatList, ToastAndroid, ScrollView, TouchableOpacity } from 'react-native';
import Storage from "../components/Storage";
import GlobalSettings from "../components/GlobalSettings";



class AppSettings extends React.Component { 
  constructor({props, route}) {
    super();
    this.state = {
      // Saved BLE
      deviceName: null,
      deviceId: null,
      serviceId: null,
      characteristicId: null,
      // App Settings
      DEBUG: null,
      AutoConnectBLEUponStart: null,
      SetNotificationPermissionUponStart: null,
      SearchDeviceById: null
    };
  };

  componentDidMount() {
    console.log("componentDidMount start.");
    // Get characteristic from Storage
    setTimeout(() => {
      this.fetchCharacteristic();
      // this.fetchAppSettings();
    }, 100);
    console.log(this.state);

  };

  AppSettingsComponentJSX = (key) => {
    return (
      <View>
        <Text>{key}: {this.state[key] ? "true": "false"}</Text>
        <Button title="Toggle" onPress={() => this.toggleAppSettings(key)}/>
      </View>
    );
  }

  toggleAppSettings = (k) => {
    this.setState({[k]: !this.state[k]});
    Storage.saveText(k, this.state[k]);
  };

  fetchCharacteristic = async () => {
    console.log("Fetching BLE information.");
    this.fetchAndSetState("deviceName");
    this.fetchAndSetState("serviceId");
    this.fetchAndSetState("deviceId");
    this.fetchAndSetState("characteristicId");
  }

  fetchAppSettings = async () => {
    console.log("Fetching App Settings.");
    this.fetchAndSetState("DEBUG", true);
    this.fetchAndSetState("AutoConnectBLEUponStart", true);
    this.fetchAndSetState("SetNotificationPermissionUponStart", true);
    this.fetchAndSetState("SearchDeviceById", true);
  };

  fetchAndSetState = (k, isGlobalSettings) => {
    const promise = Storage.fetchText("@" + k);
    if(!isGlobalSettings){
      promise.then((v) => this.setState({[k]: v}));
    } else {
      promise.then((v) => {
        if(v == null){  // if saved v is null, use Global Settings
          this.setState({[k]: GlobalSettings[k]});
        } else {
          this.setState({[k]: v})
        }
      });
    };
  }

  render() {
    return (
      <ScrollView>
        <View>
          <Text style={styles.h1}>已保存BLE特征(Saved BLE)：</Text>
          <Text>装置名称（Device Name）: {this.state.deviceName}</Text>
          <Text>装置ID（Device Id）: {this.state.deviceId}</Text>
          <Text>服务ID（Service Id）: {this.state.serviceId}</Text>
          <Text>特征ID（Characteristic Id）: {this.state.characteristicId}</Text>
        </View>

        {/* <View style={styles.lineStyle}/>
        <View>
          <Text style={styles.h1}>App Settings：</Text>
          {this.AppSettingsComponentJSX("DEBUG")}
          {this.AppSettingsComponentJSX("AutoConnectBLEUponStart")}
          {this.AppSettingsComponentJSX("SetNotificationPermissionUponStart")}
          {this.AppSettingsComponentJSX("SearchDeviceById")}
        </View> */}
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  gridItem: {
    height: 60,
    borderWidth: 0.5,
    borderColor: 'gray',
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

export default AppSettings;