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
            <TouchableOpacity style={Styles.BLEfuncButton}>
                <Image resizeMode='contain' style={Styles.vultantButton} source={require("../img/demo_presentation_mode.png")}/>
                {/* <View style={Styles.absoluteView}>
                    <Text style={Styles.p}>Presentation Mode</Text>
                </View> */}
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
                {/* <View style={Styles.absoluteView}>
                    <Text style={Styles.p}>Edit Notes</Text>
                </View> */}
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
                {/* <View style={Styles.absoluteView}>
                    <Text style={Styles.p}>Edit Cue Cards</Text>
                </View> */}
            </TouchableOpacity>
          </View>
          <View style={[Styles.BLEfuncButton]}>
            <TouchableOpacity style={Styles.BLEfuncButton} onPress={() => {
              this.props.navigation.navigate("Settings", {
                characteristic: this.props.characteristic,
                setSpinner:  this.props.setSpinner,
                setAllowAppList: this.props.setAllowAppList
              })}
            }>
                <Image resizeMode='contain' style={Styles.vultantButton} source={require("../img/demo_general_settings.png")}/>
                {/* <View style={Styles.absoluteView}>
                    <Text style={Styles.p}>General Settings</Text>
                </View> */}
            </TouchableOpacity>
          </View>     
        </View>
        {/* <View style={[{position: 'relative', height: 80}]}>
          <TouchableOpacity style={Styles.BLEfuncButton} onPress={() => {
            this.props.navigation.navigate("Notification", {
              characteristic: this.props.characteristic,
              setSpinner:  this.props.setSpinner
            });
          }}>
            <Text style={Styles.greenText}>{'>'} 自定APP推送消息（Custom Notification）</Text>
          </TouchableOpacity>
          <TouchableOpacity style={Styles.BLEfuncButton} onPress={() => this.props.disconnectDevice()}>
            <Text style={Styles.greenText}>{'>'} 断开设备（Disconnect from device）</Text>
          </TouchableOpacity>
        </View> */}
      </View>
    );
  }
}

export default BLEFunctions;
