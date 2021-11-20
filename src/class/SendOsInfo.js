import Writer from './Writer';
import BLEUtils from './BLEUtils';

// 链接到蓝牙后，要发OS信息到眼镜
class SendOsInfo {
  static send(os, characteristic, SuccessWriteFn, ErrWriteFn) {
    content = (os === 'ios') ? "01" : "00"
    contentHex = BLEUtils.numStrToHex(content)
    msgInfo = new Writer.MsgInfo("A0", "05", "59", "00")
    Writer.Writer.write(msgInfo, content, characteristic, SuccessWriteFn, ErrWriteFn, AlertFn)
  }
}
export default SendOsInfo

    // const content = this.state.notes.length > 0 ? this.state.notes[0].content : "";
    // const notesHex = BLEUtils.utf8ToUtf16Hex(content)
    // const entireContentHex = imgIdHex + titleHex + notesHex;


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

// export default SendOsInfo;