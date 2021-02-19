import SettingsType from "./SettingsType";

const SettingsData = [
  {
    id: "displayTimeOut",
    title: "熄屏时间（Display TimeOut）",
    type: SettingsType.numeric,
    sAttri1HexStr: "56" // HARDCODED
  },
  // {
  //   id: "doNotDisturb",
  //   title: "Do Not Disturb",
  //   type: SettingsType.boolean,
  //   sAttri1HexStr: "59" // HARDCODED (not in document)
  // },
  {
    id: "language",
    title: "语言（Language）",
    type: SettingsType.language,
    sAttri1HexStr: "52" // HARDCODED
  },
  // {
  //   id: "appEnable",
  //   title: "App Enable/Disable",
  //   type: SettingsType.boolean,
  //   sAttri1HexStr: "60" // HARDCODED (not in document)
  // },
  {
    id: "bluetoothName",
    title: "蓝牙装置名称（Bluetooth Device Name）",
    type: SettingsType.text,
    sAttri1HexStr: "58" // HARDCODED
  },
  {
    id: "msgDispTime",
    title: "信息显示停留时间（Message Display Time, seconds）",
    type: SettingsType.numeric,
    sAttri1HexStr: "55" // HARDCODED
  }
];

export default SettingsData;