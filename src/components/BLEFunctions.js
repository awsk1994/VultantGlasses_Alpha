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
              this.props.navigation.navigate("Notification", {
                characteristic: this.props.characteristic,
                setSpinner:  this.props.setSpinner
              });
            }}>
                <Image style={Styles.vultantButton} source={require("../img/demo_button.png")}/>
                <View style={Styles.absoluteView}>
                    <Text style={Styles.p}>自定APP推送消息（Custom Notification）</Text>
                </View>
            </TouchableOpacity>
          </View>
          <View style={[Styles.BLEfuncButton]}>
            <TouchableOpacity style={Styles.BLEfuncButton} onPress={() => {
              this.props.navigation.navigate("Notes", {
                characteristic: this.props.characteristic,
                setSpinner:  this.props.setSpinner
              })
            }}>
                <Image style={Styles.vultantButton} source={require("../img/demo_button.png")}/>
                <View style={Styles.absoluteView}>
                    <Text style={Styles.p}>记事本（Notes）</Text>
                </View>
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
                <Image style={Styles.vultantButton} source={require("../img/demo_button.png")}/>
                <View style={Styles.absoluteView}>
                    <Text style={Styles.p}>ppt笔记（Cue Card）</Text>
                </View>
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
                <Image style={Styles.vultantButton} source={require("../img/demo_button.png")}/>
                <View style={Styles.absoluteView}>
                    <Text style={Styles.p}>眼镜设置（Glasses Settings）</Text>
                </View>
            </TouchableOpacity>
          </View>     
        </View>
      </View>
    );
  }
}

export default BLEFunctions;
