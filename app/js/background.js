let intervalId;

function loadOptionsAndFetch(){
  loadOptions().then( options  => restartFetching(options) )
}

chrome.storage.onChanged.addListener(function({options}, area){
  if(area != "sync") return
  loadOptionsAndFetch()
})

loadOptionsAndFetch()

function restartFetching(options){
  if(!options) return
  if(intervalId) clearInterval(intervalId)
  invetrvalId = setInterval(() => fetchStatus(options), options.refreshRate * 60000)
}

function fetchStatus(options){
  var creds = new AWS.Credentials(options.keyId, options.accessKey);
  AWS.config.credentials = creds;
  AWS.config.update({region: options.regionName})
  var ec2 = new AWS.EC2();
  ec2.describeInstances({InstanceIds: [
    options.instanceId
  ]}, function(err, data){
    let instanceState = data.Reservations[0].Instances[0].State.Name
    if(instanceState === "stopped"){
      chrome.browserAction.setIcon({path: 'img/red.png'})
    }else if(instanceState === "running"){
      chrome.browserAction.setIcon({path: 'img/green.png'})
    }
    console.log(err)
    console.log(data)
  })
}

///////////////////////////////////////////////////////////////////////////////

let optionsTabId = ""

function openOptionsTab() {
  if(optionsTabId){
    chrome.tabs.get(optionsTabId, (tab) => {
      if(tab) chrome.tabs.update(tab.id, {active: true})
      chrome.windows.getCurrent({}, (currentWindow) => {
        if(tab.windowId != currentWindow.id){
          chrome.windows.update(tab.windowId, {focused: true})
        }
      })
    })
  }
  else{
    chrome.tabs.create({'url': chrome.extension.getURL('options.html'),
      'selected': true}, (tab) => optionsTabId = tab.id);
  }
}

chrome.browserAction.onClicked.addListener(openOptionsTab)

chrome.tabs.onRemoved.addListener((tabId, changeInfo, tab) => {
  if(optionsTabId == tabId)
    optionsTabId = ""
})
