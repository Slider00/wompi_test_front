// Polyfill para crypto.getRandomValues en React Native
const globalObj = globalThis as any;

if (typeof globalObj.crypto !== 'object') {
  globalObj.crypto = {};
}

if (typeof globalObj.crypto.getRandomValues !== 'function') {
  globalObj.crypto.getRandomValues = function (array: any) {
    for (let i = 0; i < array.length; i++) {
      // Genera bytes pseudo-aleatorios de 0 a 255
      array[i] = Math.floor(Math.random() * 256);
    }
    return array;
  };
}

if (typeof globalObj.self === 'object' && !globalObj.self.crypto) {
  globalObj.self.crypto = globalObj.crypto;
}
