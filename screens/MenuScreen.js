import React from 'react';
import { Button, View, Text, ScrollView, StyleSheet, TouchableOpacity, ToastAndroid } from 'react-native';
import BLEMenu from "../components/BLEMenu";
import DemoComponent from "../components/DemoComponent";
import { BleManager } from 'react-native-ble-plx';
import Storage from "../components/Storage";

// TODO: Reset Characteristic/Device functionality

class MenuScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      characteristic: null, // this.fetchObject('@characteristic'),
      deviceName: null,
      deviceId: null,
      serviceId: null,
      characteristicId: null,
      selectedDevice: null,
      selectedService: null,
      selectedCharacteristic: null
    };
    console.log("MenuScreen");
    this.bleManager = new BleManager();
  };

  componentDidMount() {
    console.log("componentDidMount start.");

    setTimeout(() => {
      this.fetchCharacteristic();
    }, 1000);

    // // Below is only for debugging purposes.
    // setTimeout(() => {
    //   console.log("DEBUG | Read BLE info");
    //   this.connectBLE();
    // }, 5000);
    
   };
   
  connectBLE = async () => {
    this.bleManager.startDeviceScan(null, {allowDuplicates: false}, this.scanAndConnect);
  }

  componentWillUnmount() {
    console.log("ComponentUnMount");  // TODO: Getting error. Unable to detect when bleManager is undefined...
    if(this.bleManager != null || typeof this.bleManager != "undefined"){
      // this.bleManager.destroy();
    }
  }

  scanAndConnect = (error, device) => {
    if (error) {
      console.log("onScannedDevice | ERROR:");
      console.log(error);
      ToastAndroid.show("ERROR: " + error, ToastAndroid.SHORT);
      return
    }

    if(device.id != this.state.deviceId){
      console.log("Cannot find device.");
      return;
    }

    console.log("Found device!");
    this.bleManager.stopDeviceScan();
    device.connect()
      .then((device) => {
        return device.discoverAllServicesAndCharacteristics();
      })
      .then((device) => {
        console.log(device.id);
        device.services().then((services) => {
         let service = services.find(service => service.uuid == this.state.serviceId);
          console.log("Found Service!");

          service.characteristics().then((characteristics) => {
            let characteristic = characteristics.find(c => c.uuid == this.state.characteristicId);
            console.log("Found characteristic!");
            this.setState({characteristic});
          })
        })
      })
      .catch((error) => {
        console.log(error);
      });

  };

  debug = () => {
    console.log("Debug | characteristic");
    console.log(this.state.characteristic);
  }

  fetchCharacteristic = async () => {
    console.log("Fetching BLE information.");
    const deviceNamePromise = Storage.fetchText('@deviceName');
    deviceNamePromise.then((v) => this.setState({'deviceName': v}));

    const deviceIdPromise = Storage.fetchText('@deviceId');
    deviceIdPromise.then((v) => this.setState({'deviceId': v}));

    const servicePromise = Storage.fetchText('@serviceId');
    servicePromise.then((v) => this.setState({'serviceId': v}));

    const characteristicPromise = Storage.fetchText('@characteristicId');
    characteristicPromise.then((v) => this.setState({'characteristicId': v}));
  }

  resetBLEConnection = () => {
    this.setState({
      deviceName: null,
      deviceId: null,
      serviceId: null,
      characteristicId: null,
      selectedDevice: null,
      selectedService: null,
      selectedCharacteristic: null,
      characteristic: null
    });
    Storage.clearBLEStorage();
    // TODO: confirm below 2 lines of code.
    this.bleManager.destroy();
    this.bleManager = new BleManager();
  }

  updateMenuCharacteristic = (characteristic, deviceName, deviceId, serviceId, characteristicId) => {
    this.setState({characteristic, deviceName, deviceId, serviceId, characteristicId});
  };

  render() {
    return (
      <ScrollView>
        <Text>Characteristic Selected: {this.state.characteristic == null ? "False" : "True" }</Text>
        <Text>Device Name: {this.state.deviceName}</Text>
        <Text>Device Id: {this.state.deviceId}</Text>
        <Text>Service Id: {this.state.serviceId}</Text>
        <Text>Characteristic Id: {this.state.characteristicId}</Text>


        <View style={styles.button}>
          <Button title="Choose Device" onPress={() => {
                this.props.navigation.navigate("BLEMenu", {
                  bleManager: this.bleManager,
                  updateMenuCharacteristic: this.updateMenuCharacteristic
                })
              }}/>
        </View>

        <View style={styles.button}>
          <Button title="Fetch from Storage" onPress={this.fetchCharacteristic}/>
        </View>

        <View style={styles.button}>
          <Button title="Start BLE Connection" onPress={this.connectBLE}/>
        </View>

        <View style={styles.button}>
          <Button title="Reset BLE Connection" onPress={this.resetBLEConnection}/>
        </View>

        <View style={styles.button}>
          <Button title="Debug" onPress={this.debug}/>
        </View>


        {/* <Button title="Reset Characteristic" onPress={this.resetBLEConnection}/> */}
        {/* <BLEMenu
            updateCharacteristic={this.updateCharacteristic}
            updateDeviceName={this.updateDeviceName}
          /> */}
        {/* <DemoComponent/> */}

        <View style={styles.lineStyle}/>
        {this.state.characteristic != null && <View>
          <View style={styles.button}>
            <Button title="Notification" onPress={() => {
              this.props.navigation.navigate("Notification", {
                characteristic: this.state.characteristic 
              });
            }}/>
          </View>
          <View style={styles.button}>
            <Button title="Notes" onPress={() => {
              this.props.navigation.navigate("Notes", {
                characteristic: this.state.characteristic
              })
            }}/>
          </View>
          <View style={styles.button}>
            <Button title="Cue Card" onPress={() => {
              this.props.navigation.navigate("CueCard", {
                characteristic: this.state.characteristic
              })
            }}/>
          </View>
          <View style={styles.button}>
            <Button title="Settings" onPress={() => {
              this.props.navigation.navigate("Settings", {
                characteristic: this.state.characteristic
              })}
            }/>
          </View>
        </View>}
      </ScrollView>
    )
  }
}

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

export default MenuScreen;