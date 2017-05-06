chrome.storage.sync.get('options', ({options}) => {
  if(options) {
    console.log(options)
    fetchStatus(options)
  }
})

function fetchStatus(options){
  var creds = new AWS.Credentials(options.keyId, options.accessKey);
  AWS.config.credentials = creds;
  AWS.config.update({region: options.regionName})
  var ec2 = new AWS.EC2();
  // let query = "Reservations[0].Instances[0].State.Name"
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
