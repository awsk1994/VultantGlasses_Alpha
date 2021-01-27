function strToUnicode(str, toUnicodeString=false) {
	return str.split('').map(function (value, index, array) {
    var temp = value.charCodeAt(0).toString(16).padStart(4, '0'); // converts it to hex string
		return toUnicodeString ? '\\u' + temp : String.fromCharCode(parseInt(temp, 16));
	}).join('');
};

function singleHexToUnicode(str, toHexString) {
  return toHexString ? 'x' + str : String.fromCharCode(parseInt(str, 16));
}

console.log("===== strToUnicode =====");
console.log(strToUnicode('你好'));
console.log(strToUnicode('你好', toUnicodeString=true));  // \u4f60\u597d 
console.log(strToUnicode('abc'));
console.log(strToUnicode('abc', toUnicodeString=true));   // \u0061\u0062\u0063

console.log("\n\n===== singleHexToUnicode =====");
console.log(singleHexToUnicode('61'));  // a
console.log(singleHexToUnicode('61', toHexString=true)); // x61
console.log(singleHexToUnicode('100')); // Ā
console.log(singleHexToUnicode('400')); // Ѐ
console.log(singleHexToUnicode('400', toHexString=true)); // Ѐ
console.log(singleHexToUnicode('4F60')); // 你
console.log(singleHexToUnicode('4F60', toHexString=true)); // 你 -> unicode = E4 BD A0

console.log(singleHexToUnicode('A0'));


console.log(singleHexToUnicode('100') + singleHexToUnicode('400')); // ĀЀ



console.log(singleHexToUnicode('01').toString('base64'));