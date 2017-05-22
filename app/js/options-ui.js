const $i = document.getElementById.bind(document)

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
    saveOptions(options).then(() => window.close())
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
