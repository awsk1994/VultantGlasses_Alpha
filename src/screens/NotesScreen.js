import React from 'react';
import { FlatList, View, Text, TextInput, Button, ScrollView } from 'react-native';
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

  notesList = () => {
    listItem = (itemData) => {
      return (
        <View>
          <View style={Styles.lineStyle}/>
          <View style={Styles.settingsItem}>
            <Button title="-" onPress={() => delElement(itemData.index)}/>
            <Text>Title</Text>
            <TextInput
              placeholder="Enter title here..."
              value={itemData.item.title}
              onChangeText={v => onChangeTitle(v, itemData.index)}
            />
            <Text>Notes</Text>
            <TextInput
              placeholder="Enter notes here..."
              value={itemData.item.content}
              onChangeText={v => onChangeContent(v, itemData.index)}
            />
          </View>
        </View>
      )
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

    onChangeTitle = (v, idx) => {
      changeNotesParentFnBefore();
      let newLst = this.state.notes;
      newLst[idx].title = v;
      changeNotesParentFnAfter(newLst);
    };

    onChangeContent = (v, idx) => {
      changeNotesParentFnBefore();
      let newLst = this.state.notes;
      newLst[idx].content = v;
      changeNotesParentFnAfter(newLst);
    };

    addElement = () => {
      changeNotesParentFnBefore();
      let newLst = this.state.notes;
      newLst.push({id: this.state.notes.length, imgId: "00", title: "", content: ""});
      changeNotesParentFnAfter(newLst);
    };

    delElement = (idx) => {
      changeNotesParentFnBefore();
      let newLst = this.state.notes;
      newLst.splice(idx, 1);  // change splice method
      changeNotesParentFnAfter(newLst);
    };

    return (
      <View>
        <Button title="+" onPress={() => addElement()}/>
        <FlatList keyExtractor={(item, index) => item.id} data={this.state.notes} renderItem={listItem}/>
        <BLERead characteristic={this.state.characteristic} setSpinner={this.setSpinner}/>
      </View>
    )
  }

  render() {
    return (
      <ScrollView style={{margin: 10}}>
        {this.notesList()}
      </ScrollView>
    )
  };
}

export default NotesScreen;