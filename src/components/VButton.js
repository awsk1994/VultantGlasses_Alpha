import React from "react";
import { View, Text, Button, StyleSheet, TouchableOpacity, Image} from 'react-native';
import GlobalSettings from '../data/GlobalSettings';
import Styles from "../class/Styles";

class VButton extends React.Component { 
  
  VColor = {
    "green":require("../img/Green_Box.png"),
    "green_fill": require("../img/Green_Box_Filled.png"),
    "red": require("../img/Red_Box.png"),
    "red_fill": require("../img/Red_Box_Filled.png"),
    "yellow": require("../img/Yellow_Box.png"),
    "yellow_fill": require("../img/Yellow_Box_Filled.png"),
    "white": require("../img/Green_Box.png"), // TODO: Green_Box for now.
    // "white_fill": require("../img/White_Box_Filled.png"),
  };

  imgPath = "../img/Yellow Box.png";

  constructor(props) {
    super();
    this.fill = (props.fill != null);
    this.color = props.color;
    this.imgPath = (this.fill ? this.VColor[props.color + "_fill"] : this.VColor[props.color]);
    this.onPress = props.onPress;
    this.text = props.text;
  };

  render() {
    return (
      <TouchableOpacity style={[Styles.BLEfuncButton]} onPress={this.onPress}>
        <Image resizeMode='contain' style={[Styles.vultantButton, Styles.absoluteView]} source={this.imgPath}/>
        <View style={{alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'row'}}>
          <View style={{alignItems: 'center', justifyContent: 'center'}}>
            <Text style={{color: this.color}}>
              {this.text}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }
}

export default VButton;
