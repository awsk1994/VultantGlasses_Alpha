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

class BLEMenu extends React.Component {
  constructor(props) {
    super();
    this.state = {
      status: null,
      scanning: false,
      devices: [],
      services: [],
      characteristics: [],
      characteristic: null,
      readValue: null,
      writeValue: null,
      rawOp: false,
      CRC: "",
      vMsgHeader: "00",
      vMsgPAttri: "00",
      vMsgSAttri1: "00",
      vMsgSAttri2: "00",
      vMsgContent: "00",
      vMsgCRC: "00",
      deviceName: null
    };
    console.log(props);
    this.bleManager = props.route.params.bleManager;
    this.updateMenuCharacteristic = props.route.params.updateMenuCharacteristic;
    this.setSpinner = props.route.params.setSpinner;
  };

  componentWillUnmount() {
    // console.log("ComponentUnMount");  // TODO: Getting error. Unable to detect when bleManager is undefined...
    // if(this.bleManager != null || typeof this.bleManager != "undefined"){
    //   this.bleManager.destroy();
    // }
  }

  scanDevices = async () => {
    this.bleManager.stopDeviceScan();
    console.log("Scanning Devices");
    this.setState({scanning: true});
    this.bleManager.startDeviceScan(null, {allowDuplicates: false}, this.onScannedDevice);
  };

  onScannedDevice = (error, device) => {
    console.log(device);
    if (error) {
      console.log("onScannedDevice | ERROR:");
      console.log(error);
      Utils.genericErrAlert(error);
      // ToastAndroid.show("ERROR: " + error, ToastAndroid.SHORT);
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

  debugState = () => {
    console.log(this.state);
  }

  reset = () => {
    this.setState({
      devices: [],
      services: [],
      characteristics: [],
      characteristic: null,
      readValue: null,
      writeValue: null
    });
  }

  connectDevice = async (device) => {
    try{
      this.setSpinner(true);
      this.stopScan() // Stop Scanning
      console.group("Connecting to Device.");
      await this.bleManager.connectToDevice(device.id, {
        requestMTU: 512
      });
      console.log('Connected to Device：', device.id)
      // ToastAndroid.show("Connected to Device：" + device.id, ToastAndroid.SHORT);

      let serviceAndChar = await device.discoverAllServicesAndCharacteristics();
      console.log('Getting services and characteristics...');
      console.log(serviceAndChar);
      this.onPressDevice(device);
      this.setSpinner(false);
    } catch(err){
      console.log("connectDevice | ERROR");
      console.log(err);
      Utils.genericErrAlert(err);
      // ToastAndroid.show("ERROR: " + err, ToastAndroid.SHORT);
      this.setSpinner(false);
    }
  };

  onPressDevice = async (device) => {
    console.log("onPressDevice");
    this.setSpinner(true);
    try{
      let services = await device.services();
      this.setState({services});
      this.setState({
        deviceName: device.localName
      })
      this.setSpinner(false);
    } catch(err) {
      console.log("connectDevice | ERROR");
      console.log(err);
      Utils.genericErrAlert(err);
      // ToastAndroid.show("ERROR: " + err, ToastAndroid.SHORT);
      this.setSpinner(false);
    }
  };

  onPressService = async(service) => {
    console.log("onPresService");
    this.setSpinner(true);
    try{
      let characteristics = await service.characteristics();
      this.setState({characteristics});
      this.setSpinner(false);
    } catch(err){
      console.log("connectDevice | ERROR");
      console.log(err);
      Utils.genericErrAlert(err);
      // ToastAndroid.show("ERROR: " + err, ToastAndroid.SHORT);
      this.setSpinner(false);
    }
  };

  onPressCharacteristic = async(characteristic) => {
    this.setSpinner(true);
    console.log("onPressCharacteristic")
    this.setState({characteristic});
    this.updateCharacteristic(characteristic);
    this.props.navigation.goBack();
    this.setSpinner(false);
  }

  onPressReadOp = async() => {
    console.log("onPressReadOp");
    this.setSpinner(true);
    try{
      let char = await this.state.characteristic.read();
      console.log("Characteristics Read Value: " + char.value);
      // ToastAndroid.show("Characteristics Read Value: " + char.value, ToastAndroid.SHORT);
      this.setState({readValue: char.value});
      this.setSpinner(false);
    } catch(err){
      console.log("ERROR:");
      console.log(err);
      Utils.genericErrAlert(err);
      // ToastAndroid.show("ERROR: " + err, ToastAndroid.SHORT);
      this.setSpinner(false);
    }
  };

  onPressWriteHexOp = (writeVal) => {
    if (!writeVal) {
      Alert.alert('请输入要写入的特征值')
    }
    const str = Buffer.from(writeVal, 'hex').toString('base64')
    this.onPressWriteOp(str);
  }
  
  onPressWriteStrOp = (writeVal) => {
    if (!writeVal) {
      Alert.alert('请输入要写入的特征值')
    }
    const str = Buffer.from(writeVal, 'utf8').toString('base64');
    this.onPressWriteOp(str);
  };

  onPressWriteOp = (msg) => {
    // ToastAndroid.show('开始写入特征值：' + msg, ToastAndroid.SHORT);

    this.state.characteristic.writeWithResponse(msg)
      .then(() => {
        Alert.alert('成功写入特征值', '现在点击读取特征值看看吧...')
      })
      .catch(err => {
        console.log('写入特征值出错：', err);
        Utils.genericErrAlert(err);
        // ToastAndroid.show("ERROR: " + err, ToastAndroid.SHORT);
      })
  };

  onPressSampleWriteA = () => {
    this.onPressWriteHexOp("A00112000068656c6c6fc7");
  };

  onPressWriteVMsg = () => {
    const hexStr = this.state.vMsgHeader 
    + this.state.vMsgPAttri 
    + this.state.vMsgSAttri1
    + this.state.vMsgSAttri2
    + this.state.vMsgContent;

    const CRCHex = BLEUtils.sumHex(hexStr);
    console.log("write VMsg | " + (hexStr + CRCHex));
    this.onPressWriteHexOp(hexStr + CRCHex);
  }
  
  onPressCalcCRC = (writeVal) => {
    let CRC = BLEUtils.sumHex(writeVal);
    if(CRC == null){
      return "00";
    } 
    console.log("onPressCalcCRC | CRC = " + CRC);
    this.setState({"CRC": CRC});
  };

  updateCharacteristic = (characteristic) => {
    console.log("updateCharacteristic")
    Storage.saveText("@deviceId", characteristic.deviceID);
    Storage.saveText("@serviceId", characteristic.serviceUUID);
    Storage.saveText("@characteristicId", characteristic.uuid);
    Storage.saveText("@deviceName", this.state.deviceName);
    this.updateMenuCharacteristic(
      characteristic,
      this.state.deviceName, characteristic.deviceID, 
      characteristic.serviceUUID, characteristic.uuid);
  }

  render() {
    return (
      <View>
        {this.state.characteristic == null && <ScrollView>
          <Text>Vultant Testing App</Text>
          <Text>扫描中: {this.state.scanning.toString()}</Text>
          <View style={Styles.button}>
            <Button title="扫描设备(start scanning)" onPress={this.scanDevices}/>
          </View>
          <View style={Styles.button}>
            <Button title="停止扫描(stop scanning)" onPress={this.stopScan}/>
          </View>
          <View style={Styles.button}>
            <Button title="Debug" onPress={this.debugState}/>
          </View>
          <View style={Styles.button}>
            <Button title="重置(reset)" onPress={this.reset}/>
          </View>

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

          <Text style={Styles.h1}>服务（Services）:</Text>
          {this.state.services && <View>
            <FlatList 
              keyExtractor={(item, index) => index.toString()}
              data={this.state.services}
              renderItem={itemData => (
              <TouchableOpacity onPress = {() => {this.onPressService(itemData.item)}}>
                <View style={Styles.bleMenuItem}>
                  <Text>{`UUID: ${itemData.item.uuid}`}</Text>
                </View>
              </TouchableOpacity>
              )}
            />
          </View>}

          <Text style={Styles.h1}>特征（Characteristics）:</Text>
          {this.state.characteristics && <View>
            <FlatList 
              keyExtractor={(item, index) => index.toString()}
              data={this.state.characteristics}
              renderItem={itemData => (
              <TouchableOpacity onPress = {() => {this.onPressCharacteristic(itemData.item)}}>
                <View style={Styles.bleMenuItem}>
                  <Text>{`UUID: ${itemData.item.uuid}`}</Text>
                  <Text>{`可读（isReadable）: ${itemData.item.isReadable}`}</Text>
                  <Text>{`可写有回应（isWritableWithResponse）: ${itemData.item.isWritableWithResponse}`}</Text>
                  <Text>{`可写没回应（isWritableWithoutResponse）: ${itemData.item.isWritableWithoutResponse}`}</Text>
                </View>
              </TouchableOpacity>
              )}
            />
          </View>}
        </ScrollView>
        }
      </View>
    );
  }
};

export default BLEMenu;