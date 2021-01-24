class BLEUtils {
  strToBinary(str) {
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

   strToHex(str){
    if(str == null){
      return "";
    }
    return Buffer.from(str, 'base64').toString('hex');
  }

   strToUTF8(str){
    if(str == null){
      return "";
    }
    str = (new Buffer(str, 'base64')).toString('utf8');
    return str;
  }

   sumHex(hexStr){
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

   hexToFormatMsgJSX(msgStr){
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
}