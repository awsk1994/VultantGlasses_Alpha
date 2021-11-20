import BLEUtils from "./BLEUtils";
import GlobalSettings from "../data/GlobalSettings";
import { Alert } from "react-native";

class MsgInfo {
  constructor(vMsgHeader, vMsgPAttri, vMsgSAttri1, vMsgSAttri2) {
    this.vMsgHeader = vMsgHeader
    this.vMsgPAttri = vMsgPAttri
    this.vMsgSAttri1 = vMsgSAttri1
    this.vMsgSAttri2 = vMsgSAttri2
  }
}

class WriteFn {
  static NewSuccessWriteFn(closeSpinnerFn, AlertFn) {
    const SuccessWriteFn = (hexMsg) => {
      console.log('成功写入特征值', '现在点击读取特征值看看吧...');
      if(GlobalSettings.ShowAlert){
        AlertFn('成功写入特征值:' + hexMsg);
      }
      // ToastAndroid.show('成功写入特征值, 现在点击读取特征值看看吧...', ToastAndroid.SHORT);
      closeSpinnerFn()
    };
    return SuccessWriteFn
  }

  static NewErrWriteFn(closeSpinnerFn, AlertFn) {
    const ErrWriteFn = (err) => {
      console.log('写入特征值出错：', err);
      if(GlobalSettings.ShowAlert){
        AlertFn('写入特征值出错：' + err);
      }
      // ToastAndroid.show("ERROR: " + err, ToastAndroid.SHORT);
      closeSpinnerFn()
    }
    return ErrWriteFn
  }
}

class Writer {
  static write(msgInfo, contentHex, characteristic, SuccessWriteFn, ErrWriteFn, AlertFn){ 
    const hexMsgWithoutCRC = msgInfo.vMsgHeader 
    + msgInfo.vMsgPAttri 
    + msgInfo.vMsgSAttri1
    + msgInfo.vMsgSAttri2
    + contentHex;
    const CRCHex = BLEUtils.sumHex(hexMsgWithoutCRC);
    const hexMsg = hexMsgWithoutCRC + CRCHex;

    if(GlobalSettings.DEBUG){
      console.log("Writer.write | msgInfo | " + msgInfo);
      console.log("Writer.write | contentHex | " + contentHex);
      console.log("Writer.write | hexMsg with CRC | " + hexMsg);  
    }

    if (!!characteristic) {
      BLEUtils.writeHexOp(hexMsg, characteristic, 
        () => SuccessWriteFn(hexMsg, AlertFn), 
        () => ErrWriteFn(AlertFn));
    } else {
      if(GlobalSettings.ShowAlert)
        Alert.alert("Writer.write | WARN | no characteristics")
    }
  }
}
export default {Writer, MsgInfo, WriteFn};





    // const SuccessWriteFn = () => {
    //   console.log('成功写入特征值', '现在点击读取特征值看看吧...');
    //   if(GlobalSettings.ShowAlert){
    //     Alert.alert('成功写入特征值', hexMsg);
    //   }
    //   // ToastAndroid.show('成功写入特征值, 现在点击读取特征值看看吧...', ToastAndroid.SHORT);
    //   this.setSpinner(false);
    // };

    // const ErrWriteFn = (err) => {
    //   console.log('写入特征值出错：', err);
    //   if(GlobalSettings.ShowAlert){
    //     Alert.alert('写入特征值出错：', err);
    //   }
    //   // ToastAndroid.show("ERROR: " + err, ToastAndroid.SHORT);
    //   this.setSpinner(false);
    // }