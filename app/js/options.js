function generateKey(){
  var usages = ['encrypt', 'decrypt']
  var extractable = false
  return crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 },
    extractable,
    usages)
}

function getKeyIv(){
  return new Promise(function(resolve,reject){
    var db = new Dexie("KeyStore")
    db.version(1).stores({
      keys: 'name,key,iv'
    })
    db.keys.get('MyKey').then(function(keyFromDB){
      if(keyFromDB){
        resolve(keyFromDB)
      }else{
        generateKey().then(function(generatedKey){
          const iv = crypto.getRandomValues(new Uint8Array(12))
          db.keys.put({name: "MyKey", key: generatedKey, iv: iv}).then(function(){
            resolve({key:generatedKey, iv: iv})
          })
        })
      }
    })
  })
}

const strToUInt8 = str => Uint8Array.from(str.split(''), c=>c.charCodeAt(0))
const uInt8ToStr = buf => String.fromCharCode(...buf)

const loadUInt8 = str => Uint8Array.from(str.split(','))
const storeUInt8 = buf => buf.toString()

function loadOptions(){
  return new Promise(function(resolve, reject){
    chrome.storage.local.get('enc_options', ({enc_options}) => {
      getKeyIv().then(function({key, iv}){
        const buffer = loadUInt8(enc_options);
        return crypto.subtle.decrypt({name: "AES-GCM",iv:iv}, key, buffer)
        .then(function(decrypted){
          let decryptedArr = new Uint8Array(decrypted)
          let decodedStr = uInt8ToStr(decryptedArr)
          const optionsObj = JSON.parse(decodedStr)
          resolve(optionsObj)
        })
      }).catch((err)=>{
        console.error(err)
      })
    })
  })
}

function saveOptions(options){
  return new Promise(function(resolve, reject){
    const stringified = JSON.stringify(options)
    getKeyIv().then(function({key,iv}){
      const buffer = strToUInt8(stringified);
      crypto.subtle.encrypt({
        name: "AES-GCM",
        iv: iv
      }, key, buffer).then(function(encrypted){
        let encArr = new Uint8Array(encrypted)
        const decodedStrOptions = storeUInt8(encArr)
        chrome.storage.local.set({'enc_options':decodedStrOptions},(res) => {
          if(chrome.runtime.lastError){
            reject(runtime.lastError)
          }
          resolve()})
      })
    })
  })
}

const $i = document.getElementById.bind(document)

const defaultOptions = {regionName:'',keyId:'',accessKey:'',instanceId:'',refreshRate:''}

loadOptions().then((options = defaultOptions) => {
  Reflect.ownKeys(options).forEach(function(key){
    $i(key).value = options[key]
  })
  $i('save_btn').classList.remove('disabled')
}).catch((err)=>{
  console.error(err)
})

$i('save_btn').addEventListener('click',save)

function save(event){
  const options = Reflect.ownKeys(defaultOptions).reduce(function(acc, val){
    acc[val] = $i(val).value.trim()
    return acc
  },{})
  if(isValid()){
    saveOptions(options).then(() => console.info(0))
  }else{
    const targetClassList = event.target.classList
    if(targetClassList.contains('shake-btn')){
      targetClassList.remove('shake-btn')
      void event.target.offsetWidth // restart animation (forces reflow)
    }
    targetClassList.add('shake-btn')
    event.preventDefault()
    return
  }
}

function isValid(){
  return true
}

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}
