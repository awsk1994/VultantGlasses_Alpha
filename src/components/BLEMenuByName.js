import React from "react";
import { TextInput, Alert, StyleSheet, View, Text, Button, FlatList, ToastAndroid, ScrollView, TouchableOpacity } from 'react-native';
import { BleManager } from 'react-native-ble-plx';
import BLEUtils from "../class/BLEUtils";
import { Buffer } from 'buffer/'
import Storage from "../class/Storage";
import Utils from "../class/Utils";
import Styles from "../class/Styles";
import BLEStatus from "../data/BLEStatus";

// TODO: Move this to screens folder.

class BLEMenuByName extends React.Component {
  constructor(props) {
    super();
    this.state = {
      status: null,
      scanning: false,
      devices: [],
      deviceName: null
    };
    this.props = props;
    this.bleManager = props.route.params.bleManager;
    this.updateMenuCharacteristic = props.route.params.updateMenuCharacteristic;
    this.setSpinner = props.route.params.setSpinner;
    this.setSpinner(true);
  };

  componentWillUnmount(){
    console.log("unmount");
    console.log("Clear continouous scan interval.");
    clearTimeout(this.continuousScan);
    this.bleManager.stopDeviceScan();
  }

  componentDidMount(){
    setTimeout(this.scanDevices, 10);
    this.continuousScan = setInterval(() => {
      this.scanDevices()
    }, 15000);
  }

  scanDevices = async () => {
    console.log("Scanning device.");
    this.reset();
    this.bleManager.stopDeviceScan();
    console.log("Scanning Devices");
    this.setState({scanning: true});
    this.bleManager.startDeviceScan(null, {allowDuplicates: false}, this.onScannedDevice);
  };

  onScannedDevice = (error, device) => {
    // console.log(device);
    if (error) {
      console.log("onScannedDevice | ERROR:");
      console.log(error);
      Utils.genericErrAlert(error);
      this.stopScan();
      this.props.navigation.goBack();
      return
    }
    
    if (this.state.devices.findIndex(item => item.id === device.id) < 0) {
      this.setState({
        devices: [...this.state.devices, device]
      })
    };
  };

  stopScan = () => {
    this.bleManager.stopDeviceScan()
    this.setState({ scanning: false })
  };

  // debugState = () => {
  //   console.log(this.state);
  // }

  reset = () => {
    this.setState({
      devices: []
    });
  }

  connectDevice = async (device) => {
    try{
      console.log("connect device");
      this.setSpinner(true);
      this.stopScan() // Stop Scanning

      console.log("Connecting to Device.");
      await this.bleManager.connectToDevice(device.id, {requestMTU: 512});
      this.setState({deviceName: device.localName});
      console.log('Connected to Device：', device.id)

      let serviceAndChar = await device.discoverAllServicesAndCharacteristics();
      console.log('Getting services and characteristics...');
      console.log(serviceAndChar);

      let services = await device.services();
      let selService = services[services.length - 1];
      
      let characteristics = await selService.characteristics();
      let selCharacteristic = characteristics[characteristics.length - 1];
      
      this.updateCharacteristic(selCharacteristic);
      this.props.navigation.goBack();
      this.setSpinner(false);
    } catch(err){
      console.log("connectDevice | ERROR");
      console.log(err);
      Utils.genericErrAlert(err);
      // ToastAndroid.show("ERROR: " + err, ToastAndroid.SHORT);
      this.stopScan();
      this.props.navigation.goBack();
      this.setSpinner(false);
    }
  };

  updateCharacteristic = (characteristic) => {
    console.log("updateCharacteristic")
    Storage.saveText("@deviceId", characteristic.deviceID);
    Storage.saveText("@deviceName", this.state.deviceName);
    console.log(characteristic);
    this.updateMenuCharacteristic(
      characteristic,
      this.state.deviceName, 
      characteristic.deviceID
    );
  }

  render() {
    return (
      <View>
        <Button title="back" onPress={() => this.props.navigation.goBack()}/>
        <ScrollView>
          {/* <Text>Vultant Testing App</Text> */}
          <Text>扫描中: {this.state.scanning.toString()}</Text>
          {/* <View style={Styles.button}>
            <Button title="扫描设备(start scanning)" onPress={this.scanDevices}/>
          </View>
          <View style={Styles.button}>
            <Button title="重置(reset)" onPress={this.reset}/>
          </View> */}

          <Text style={Styles.h1}>设备（Devices）:</Text>
          {this.state.scanning && <View>
            <FlatList 
              keyExtractor={(item, index) => index.toString()}
              data={this.state.devices}
              renderItem={itemData => (
              <TouchableOpacity onPress = {() => {this.connectDevice(itemData.item)}}>
                <View style={Styles.bleMenuItem}>
                  <Text>{itemData.item.id}</Text>
                  <Text>({itemData.item.name || itemData.item.localName})</Text>
                  <Text>(serviceUUIDs = {itemData.item.serviceUUIDs})</Text>
                  {/* <Text>(isConnectable = {itemData.item.isConnectable ? })</Text> */}
                </View>
              </TouchableOpacity>
              )}
            />
          </View>}
        </ScrollView>
      </View>
    );
  }
};

export default BLEMenuByName;