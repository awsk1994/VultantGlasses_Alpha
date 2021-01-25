import AsyncStorage from '@react-native-async-storage/async-storage';

class Storage {
  static fetchText = async (key) => {
    console.log("Fetching text with key(" + key + ")");
    try {
      const value = await AsyncStorage.getItem(key);
      console.log("Fetch complete.");
      return value;
    } catch(e) {
      console.log(e);
    }
  }

  static saveText = async (key, value) => {
    console.log("Saving Text with key(" + key + ")");
    try {
      await AsyncStorage.setItem(key, value);
      console.log("save Complete.");
    } catch (e) {
      console.log(e);
    }
  };

  static clearBLEStorage = async () => {
    let keys = ["@deviceName", "@deviceId", "@serviceId", "@characteristicId"]
    try {
      for(key of keys){
        console.log(key);
        await AsyncStorage.removeItem(key);
      }      
    } catch (e) {
      console.log(e);
    }
  }
}


const deviceNamePromise = Storage.fetchText('@deviceName');
deviceNamePromise.then((v) => this.setState({'deviceName': v}));

const deviceIdPromise = Storage.fetchText('@deviceId');
deviceIdPromise.then((v) => this.setState({'deviceId': v}));

const servicePromise = Storage.fetchText('@serviceId');
servicePromise.then((v) => this.setState({'serviceId': v}));

const characteristicPromise = Storage.fetchText('@characteristicId');
characteristicPromise.then((v) => this.setState({'characteristicId': v}));


export default Storage;