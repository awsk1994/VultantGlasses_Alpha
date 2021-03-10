import React from 'react';
import { TouchableOpacity, FlatList, View, Text, TextInput, Button, ScrollView } from 'react-native';
import BLERead from "../components/BLERead";
import BLEUtils from "../class/BLEUtils";
import GlobalSettings from '../data/GlobalSettings';
import Styles from "../class/Styles";
import Storage from '../class/Storage';

const msgInfo = {
  vMsgHeader: "A0", // Hardcoded
  vMsgPAttri: "01", // Hardcoded
  vMsgSAttri1: "13", // Hardcoded
  vMsgSAttri2: "00", // Hardcoded
};

class NotesScreen extends React.Component {
  constructor({props, route}) {
    super(props);
    this.state = {
      // notes: "",
      // imgId: "00",
      notes: [],
      characteristic: route.params.characteristic
    };
    this.setSpinner = route.params.setSpinner;
  };

  componentDidMount() {
    setTimeout(() => this.fetchNotesInfo(), 100);
  };

  fetchNotesInfo = async () => {
    console.log("Fetching notes information from AsyncStorage");
    Storage.fetchObjList('@notes')
      .then((val) => this.setState({'notes': val}));
  }

  onPressWrite(){    
    this.setSpinner(true);

    const imgId = this.state.notes.length > 0 ? this.state.notes[0].imgId : "00";
    const content = this.state.notes.length > 0 ? this.state.notes[0].content : "";

    console.log("imgId = " + imgId + ", content = " + content);

    const imgIdHex = BLEUtils.numStrToHex(imgId);
    const notesHex = BLEUtils.utf8ToUtf16Hex(content);
    const entireContentHex = imgIdHex + notesHex;

    const hexMsgWithoutCRC = msgInfo.vMsgHeader 
    + msgInfo.vMsgPAttri 
    + msgInfo.vMsgSAttri1
    + msgInfo.vMsgSAttri2
    + entireContentHex;
    const CRCHex = BLEUtils.sumHex(hexMsgWithoutCRC);
    const hexMsg = hexMsgWithoutCRC + CRCHex;

    if(GlobalSettings.DEBUG){
      console.log("onPressWrite | Input utf8 | imgId = " + this.state.imgId 
      + ", notes = " + this.state.notes);
  
      console.log("onPressWrite | utf8 to hex | imgId = " + imgIdHex 
      + ", notes = " + notesHex);
  
      console.log("onPressWrite | entireContentHex | " + entireContentHex);
  
      console.log("onPressWriteCharacteristic | hexMsg with CRC | " + hexMsg);  
    }

    const SuccessWriteFn = () => {
      console.log('成功写入特征值', '现在点击读取特征值看看吧...');
      // ToastAndroid.show('成功写入特征值, 现在点击读取特征值看看吧...', ToastAndroid.SHORT);
      this.setSpinner(false);   
    };

    const ErrWriteFn = (err) => {
      console.log('写入特征值出错：', err)
      // ToastAndroid.show("ERROR: " + err, ToastAndroid.SHORT);
      this.setSpinner(false);
    }

    BLEUtils.writeHexOp(hexMsg, this.state.characteristic, SuccessWriteFn, ErrWriteFn);
  }

  addElement = () => {
    this.changeNotesParentFnBefore();
    let newLst = this.state.notes;
    newLst.push({id: this.state.notes.length, imgId: "00", title: "", content: ""});
    this.changeNotesParentFnAfter(newLst);
  };

  changeNotesParentFnBefore = () => {
    this.setSpinner(true);
  }

  changeNotesParentFnAfter = (newLst) => {
    this.setState({notes: newLst});
    Storage.saveObjList("@notes", this.state.notes);
    this.setSpinner(false);
    this.onPressWrite();
  }

  notesList = () => {
    const listItem = (itemData) => {
      return (
        <View>
          <View style={[Styles.settingsItem, {backgroundColor: '#43717B', margin: 10}]}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <Text style={Styles.notes_h1}>Title</Text>
              <TouchableOpacity onPress={() => delElement(itemData.index)}>
                <Text style={Styles.notes_h1}>X</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              placeholder="Enter title here..."
              value={itemData.item.title}
              style={Styles.blueText}
              onChangeText={v => onChangeTitle(v, itemData.index)}
              onSubmitEditing = {() => onSubmitNote()}
              onEndEditing = {() => onSubmitNote()}
            />
            <Text style={Styles.notes_h1}>Content</Text>
            <TextInput
              placeholder="Enter notes here..."
              value={itemData.item.content}
              style={Styles.blueText}
              onChangeText={v => onChangeContent(v, itemData.index)}
              onSubmitEditing = {() => onSubmitNote()}
              onEndEditing = {() => onSubmitNote()}
            />
          </View>
        </View>
      )
    };

    const onChangeTitle = (v, idx) => {
      let newLst = this.state.notes;
      newLst[idx].title = v;
      this.setState({notes: newLst});
    };

    const onChangeContent = (v, idx) => {
      let newLst = this.state.notes;
      newLst[idx].content = v;
      this.setState({notes: newLst});
    };

    const onSubmitNote = (v) => {
      this.setSpinner(true);
      Storage.saveObjList("@notes", this.state.notes);
      this.setSpinner(false);
      this.onPressWrite();
    }

    const delElement = (idx) => {
      this.changeNotesParentFnBefore();
      let newLst = this.state.notes;
      newLst.splice(idx, 1);  // change splice method
      this.changeNotesParentFnAfter(newLst);
    };

    return (
      <View>
        <FlatList keyExtractor={(item, index) => index.toString()} data={this.state.notes} renderItem={listItem}/>
        {/* <BLERead characteristic={this.state.characteristic} setSpinner={this.setSpinner}/> */}
      </View>
    )
  }

  topNav = () => {
    const topBarHeight = 75;
    return (
      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        <TouchableOpacity style={[Styles.BLEfuncButton, {height: topBarHeight, flex: 1, flexDirection: 'row'}]} onPress={() => this.props.navigation.goBack()}>
          <Text style={Styles.notes_h1}>{'<'} Edit Notes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[Styles.BLEfuncButton, {height: topBarHeight, flex: 0}]} onPress={() => this.addElement()}>
          <Text style={Styles.notes_h1}>+</Text>
        </TouchableOpacity>
      </View>
    )
  }

  render() {
    return (
      <View style={[Styles.basicBg]}>
        {this.topNav()}
        <View style={{flex: 1}}>{this.notesList()}</View>
      </View>
    )
  };
}

export default NotesScreen;