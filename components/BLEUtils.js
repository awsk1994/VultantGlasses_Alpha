import { Buffer } from 'buffer/'

class BLEUtils {
  static strToBinary(str) {
    if(str == null){
      return "";
    }
    str = str.toString();
    const result = [];
    const list = str.split("");
    for (let i = 0; i < list.length; i++) {
      const str = list[i].charCodeAt().toString(2);
      result.push(str);
    }
    return result.join("");
  }

  static strToHex(str){
    if(str == null){
      return "";
    }
    return Buffer.from(str, 'base64').toString('hex');
  }

  static strToUTF8(str){
    if(str == null){
      return "";
    }
    str = (new Buffer(str, 'base64')).toString('utf8');
    return str;
  }

  static sumHex(hexStr){
    if(hexStr == null){
      return "";
    };

    if(hexStr.length % 2 != 0){
      console.error("hexStr is not even length!");
      return null;
    }

    let sum = 0;
    for(let i = 0; i<hexStr.length; i += 2){
      let singleHex = hexStr[i] + hexStr[i+1];
      sum += parseInt(singleHex, 16);
    };

    let sumHexStr = sum.toString(16);
    if(sumHexStr.length == 0){
      return "00";
    } else if(sumHexStr.length == 1){
      return "0" + sumHexStr;
    } else {
      return sumHexStr.slice(-2);
    };
  };

  static hexToFormatMsgJSX(msgStr){
    if(msgStr == null){
      return "";
    };

    if(msgStr.length % 2 != 0){
      console.error("ERR: msgStr is not even length!");
      return null;
    };

    if(msgStr.length < 10){
      console.error("ERR: msgStr length < 10.");
      return null;
    }

    msg = {
      "header": msgStr[0] + msgStr[1],
      "pAttri": msgStr[2] + msgStr[3],
      "sAttri1": msgStr[4] + msgStr[5],
      "sAttri2": msgStr[6] + msgStr[7],
      "content": null,
      "CRC": msgStr.slice(-2)
    };

    let contentStr = "";
    for(let i=8; i<msgStr.length-2; i++){
      contentStr += msgStr[i];
    };
    msg.content = contentStr;

    return msg;
  };

  static writeHexOp = (hexStr, characteristics, SuccessWriteFn, ErrWriteFn) => {
    if (!hexStr) {
      console.log('ERROR. hexStr is empty. 请输入要写入的特征值')
    }
    const hexMsg = Buffer.from(hexStr, 'hex').toString('base64')
    console.log('开始写入特征值：' + hexMsg);

    characteristics.writeWithResponse(hexMsg)
      .then(SuccessWriteFn)
      .catch(ErrWriteFn)
  };


  static utf8ToHex(inptStr){
    const hexMsg = Buffer.from(inptStr, 'utf8').toString('hex')
    return hexMsg;
  }

  // static old_utf8ToUtf16Hex(inptStr){
  //   let unicodeArr = [];
  //   for(let i=0; i<inptStr.length; i++){
  //     let unicode = BLEUtils.utf8ToHex(inptStr[i]).padStart(4, '0');
  //     console.log("unicode = " + unicode);
  //     unicodeArr.push(unicode);
  //   };
  //   return unicodeArr.join("");    
  // }

  static utf8ToUtf16Hex(s){
    return s.split('').map(function(c) {
      return ('0000' + c.charCodeAt(0).toString(16).toUpperCase()).slice(-4);
    }).join('');
  }

  static getHexSize(hexStr){
    const s = Math.floor(hexStr.length/2);
    let sHexStr = s.toString(16);
    if(sHexStr.length == 0){
      return "00";
    } else if(sHexStr.length % 2 == 1){ // odd
      return "0" + sHexStr;
    } else {  // even
      return sHexStr;
    };
  }

  static numStrToHex(numStr){
    numHexStr = parseInt(numStr).toString(16).toString('utf8');
    if(numHexStr.length > 2){
      console.log("ERROR | Cannot parse hex str > length 2.");
      return;
    } else if(numHexStr.length == 0){
      return "00";
    } else {  // length = 1 or 2.
      return numHexStr.padStart(2, '0');
    };
  }
}

export default BLEUtils;