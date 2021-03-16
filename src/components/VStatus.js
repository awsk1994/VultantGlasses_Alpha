import React from "react";
import { View, Text, Button, StyleSheet, TouchableOpacity, Image} from 'react-native';
import GlobalSettings from '../data/GlobalSettings';
import Styles from "../class/Styles";

class VStatus extends React.Component { 
  
  constructor(props) {
    super();
    this.imgPath = require("../img/Battery_Box.png");
    this.text = props.text;
  };

  render() {
    return (
      <View>
        <Image resizeMode='contain' style={[Styles.vultantButton, Styles.absoluteView]} source={this.imgPath}/>
        <View style={{alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'row'}}>
          <View style={{alignItems: 'center', justifyContent: 'center'}}>
            <Text style={Styles.h1}>
              {this.text}
            </Text>
          </View>
        </View>
      </View>
    );
  }
}

export default VStatus;
