const $i = document.getElementById.bind(document)

let defaultOptions = {regionName:'',keyId:'',accessKey:'',instanceId:'',refreshRate:''}
chrome.storage.sync.get('options', ({options = defaultOptions}) => {
  Reflect.ownKeys(options).forEach(function(key){
    $i(key).value = options[key]
  })
  $i('save_btn').classList.remove('disabled')
})

$i('save_btn').addEventListener('click',save)

function save(event){
  let options = defaultOptions
  Reflect.ownKeys(options).forEach(function(key){
    options[key] = $i(key).value
  })
  if(isValid()){
    chrome.storage.sync.set({'options':options})
    window.close()
  }else{
    const targetClassList = event.target.classList
    if(targetClassList.contains('shake-btn')){
      targetClassList.remove('shake-btn')
      void event.target.offsetWidth // hack to restart animation (forces reflow)
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
