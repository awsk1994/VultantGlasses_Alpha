class NotificationUtil {
  static calcContentLenLimit(totalAppLenLimitInBytes, appNameLenLimit, contactLenLimit) {
    // default: totalAppLenLimitInBytes = 200, appNameLenLimit = 15, contactLenLimit = 15
    const chineseCharacterByteLen = 2;
    const dividerAndCountLen = 2  // 2 bytes
    const totalDividerAndCountLen = dividerAndCountLen * (2+3+1)  // 2 divider + 3 count + CRC
    const headerLen = 8 // 2 * 4 bytes

    const appNameByteLenLimit = appNameLenLimit * chineseCharacterByteLen; // 10 characters * 2 bytes(chinese character) = 20 bytes
    const contactByteLenLimit = contactLenLimit * chineseCharacterByteLen; // 20 bytes
    // 200 - 30 - 30 - 12 - 8 = 100
    // 120 bytes = 120/2 = 60 english/chinese characters
    const contentByteLenLimit = totalAppLenLimitInBytes - appNameByteLenLimit - contactByteLenLimit - totalDividerAndCountLen - headerLen;
    console.log("contentByteLenLimit="+contentByteLenLimit+", appNameByteLenLimit="+appNameByteLenLimit+", contactByteLenLimit="+contactByteLenLimit + 
    ", totalDividerAndCountLen="+totalDividerAndCountLen+", headerLen="+headerLen)

    const contentLenLimit = contentByteLenLimit/chineseCharacterByteLen
    console.log("calcContentLenLimit:: contentLenLimit:" + contentLenLimit)
    return contentLenLimit
  }
}

export default NotificationUtil;