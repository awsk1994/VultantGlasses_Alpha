import BLEUtils from "./BLEUtils";

class Battery {
  static GetBatteryLevel(base64HexMsg) {
    let hexStr = BLEUtils.decode64ToHexStr(base64HexMsg)
    // example: b00115000ad0 -> b0 01 15 00 0a d0 -> extract 0a
    let batteryHexStr = hexStr.substring(8, 10)
    return BLEUtils.hexToNumStr(batteryHexStr)
  }
}

export default Battery;
