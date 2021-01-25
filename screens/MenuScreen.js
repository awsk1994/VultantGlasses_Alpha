import React from 'react';
import { Button, View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import BLEMenu from "../components/BLEMenu";
import DemoComponent from "../components/DemoComponent";

// TODO: Reset Characteristic/Device functionality

class MenuScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      characteristic: null,
      deviceName: null
    };
  };

  updateCharacteristic = (newValue) => {
    this.setState({"characteristic": newValue});
  }

  updateDeviceName = (newValue) => {
    this.setState({"deviceName": newValue})
  }

  render() {
    return (
      <ScrollView>
        <Text>Characteristic Selected: {this.state.characteristic == null ? "False" : "True" }</Text>
        <Text>Device Name: {this.state.deviceName}</Text>
        {/* <Button title="Reset Characteristic" onPress={this.resetBLEConnection}/> */}
        
        <BLEMenu 
            updateCharacteristic={this.updateCharacteristic}
            updateDeviceName={this.updateDeviceName}
          />
        {/* <DemoComponent characteristic={this.state.characteristic}/> */}

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
  }
})

export default MenuScreen;