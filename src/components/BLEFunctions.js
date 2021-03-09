import React from "react";
import { View, Text, Button, StyleSheet, TouchableOpacity, Image} from 'react-native';
import GlobalSettings from '../data/GlobalSettings';
import Styles from "../class/Styles";

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
          <TouchableOpacity style={Styles.BLEfuncButton} onPress={() => {
              this.props.navigation.navigate("PresentCueCard", {
                characteristic: this.props.characteristic,
                setSpinner:  this.props.setSpinner
              })
            }}>
                <Image resizeMode='contain' style={Styles.vultantButton} source={require("../img/demo_presentation_mode.png")}/>
            </TouchableOpacity>
          </View>
          <View style={[Styles.BLEfuncButton]}>
            <TouchableOpacity style={Styles.BLEfuncButton} onPress={() => {
              this.props.navigation.navigate("Notes", {
                characteristic: this.props.characteristic,
                setSpinner:  this.props.setSpinner
              })
            }}>
                <Image resizeMode='contain' style={Styles.vultantButton} source={require("../img/demo_edit_notes.png")}/>
            </TouchableOpacity>
          </View>
        </View>
        <View style={[Styles.flexRow, {flexWrap: 'wrap'}]}>
          <View style={[Styles.BLEfuncButton]}>
            <TouchableOpacity style={Styles.BLEfuncButton} onPress={() => {
                this.props.navigation.navigate("CueCard", {
                  characteristic: this.props.characteristic,
                  setSpinner:  this.props.setSpinner
                })
              }}>
              <Image resizeMode='contain' style={Styles.vultantButton} source={require("../img/demo_edit_cuecards.png")}/>
            </TouchableOpacity>
          </View>
          <View style={[Styles.BLEfuncButton]}>
            <TouchableOpacity style={Styles.BLEfuncButton} onPress={() => {
              this.props.navigation.navigate("Settings", {
                characteristic: this.props.characteristic,
                setSpinner:  this.props.setSpinner,
                setAllowAppList: this.props.setAllowAppList,
                disconnectDevice: this.props.disconnectDevice
              })}
            }>
                <Image resizeMode='contain' style={Styles.vultantButton} source={require("../img/demo_general_settings.png")}/>
            </TouchableOpacity>
          </View>     
        </View>
      </View>
    );
  }
}

export default BLEFunctions;
