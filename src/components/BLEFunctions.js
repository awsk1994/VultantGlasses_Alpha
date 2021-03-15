import React from "react";
import { View, Text, Button, StyleSheet, TouchableOpacity, Image} from 'react-native';
import GlobalSettings from '../data/GlobalSettings';
import Styles from "../class/Styles";
import VButton from "./VButton";

class BLEFunctions extends React.Component { 
  constructor(props) {
    super();
  };

  componentDidUpdate(prevProps){
    // if(GlobalSettings.DEBUG){
    //   console.log("BLEFunctions | componentDidUpdate | props is ");
    //   console.log(this.props);
    // }
  };

  render() {
    return (
      <View>
        <View style={[Styles.flexRow, {flexWrap: 'wrap'}]}>
          <View style={[Styles.BLEfuncButton]}>
            <VButton text="PRESENTATION MODE" color="green" onPress={() => {
              this.props.navigation.navigate("PresentCueCard", {
                characteristic: this.props.characteristic,
                setSpinner:  this.props.setSpinner
              })
            }}/>
          </View>
          <View style={[Styles.BLEfuncButton]}>
            <VButton text="EDIT NOTES" color="yellow" onPress={() => {
              this.props.navigation.navigate("Notes", {
                characteristic: this.props.characteristic,
                setSpinner:  this.props.setSpinner
              })
            }}/>
          </View>
        </View>
        <View style={[Styles.flexRow, {flexWrap: 'wrap'}]}>
          <View style={[Styles.BLEfuncButton]}>
            <VButton text="Edit Cue Card" color="red" onPress={() => {
              this.props.navigation.navigate("CueCard", {
                characteristic: this.props.characteristic,
                setSpinner:  this.props.setSpinner
              })
            }}/>
          </View>
          <View style={[Styles.BLEfuncButton]}>
            <VButton text="General Settings" color="green" onPress={() => {
              this.props.navigation.navigate("Settings", {
                characteristic: this.props.characteristic,
                setSpinner:  this.props.setSpinner,
                setAllowAppList: this.props.setAllowAppList,
                disconnectDevice: this.props.disconnectDevice
              })}}/>
          </View>     
        </View>
      </View>
    );
  }
}

export default BLEFunctions;
