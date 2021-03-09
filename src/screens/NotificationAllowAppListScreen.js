import React from 'react';
import { View, Text, Switch, ScrollView, TouchableOpacity } from 'react-native';
import Storage from "../class/Storage";
import InitAllowAppList from "../data/InitAllowAppList";
import Styles from "../class/Styles";

class NotificationAllowAppListScreen extends React.Component {
  constructor({props, route}) {
    super(props);
    this.state = {
      allowAppSelectionList: [{key: "unknown", title: "unknown", toggle: false}], // declaring unknown to prevent UI error. This will be populated after retriving from Storage.
    };
    this.setAllowAppList = route.params.setAllowAppList;
    setTimeout(() => {this.fetchData();}, 100);
  };

  fetchData = async() => {
    Storage.fetchList('@allowAppList')
      .then((allowAppList) => {
        const newAllowAppSelectionList = [];
        for(var j=0; j<InitAllowAppList.length; j++){
          const appInfo = {
            title: InitAllowAppList[j],
            key: InitAllowAppList[j],
            toggle: false
          };

          for(var i=0; i<allowAppList.length; i++){
            if(allowAppList[i] == InitAllowAppList[j]){
              appInfo.toggle = true;
              break;
            }
          };

          newAllowAppSelectionList.push(appInfo);
        };
        this.setState({allowAppSelectionList: newAllowAppSelectionList});
        console.log(this.state);
      });
  }

  toggleSwitch = (val, idx) => {
    console.log("toggle switch new val = " + val + ", idx = " + idx);
    const newAllowAppSelectionList = this.state.allowAppSelectionList;
    newAllowAppSelectionList[idx].toggle = val;
    this.setState({allowAppSelectionList: newAllowAppSelectionList});
    this.updateAllowAppList();
  };

  updateAllowAppList = () => {
    const newAllowAppList = [];
    this.state.allowAppSelectionList.map((item, idx) => {
      if(item.toggle == true){
        newAllowAppList.push(item.title);
      }
    });
    if(Platform.OS === 'android'){
      this.setAllowAppList(newAllowAppList);
    };
    Storage.saveList("@allowAppList", newAllowAppList);
  };

  TopNav = () => {
    const topBarHeight = 75;
    return (
      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        <TouchableOpacity style={[Styles.BLEfuncButton, {height: topBarHeight, flex: 1, flexDirection: 'row'}]} onPress={() => this.props.navigation.goBack()}>
          <Text style={Styles.notes_h1}>{'<'} Allow App List</Text>
        </TouchableOpacity>
      </View>
    )
  }

  AppAllowList = () => {
    const AppAllowItem = (item, idx) => {
      return (
        <View>
          <View style={Styles.appAllowItem}>
            <Text style={Styles.notes_p}>{item.title}</Text>
            <Switch
              onValueChange={(val) => this.toggleSwitch(val, idx)}
              value={item.toggle}
            />
          </View>
          <View style={Styles.lightLineStyle}/>
        </View>
      )
    };

    return (
      <View>
        {this.state.allowAppSelectionList.map((item, idx) => AppAllowItem(item, idx))}
      </View>
    )
  }

  render() {
    return (
      <ScrollView style={[Styles.basicBg]}>
        {this.TopNav()}
        <View style={{flex: 1}}>
          {this.AppAllowList()}
        </View>
      </ScrollView>
    )
  };
}

export default NotificationAllowAppListScreen;