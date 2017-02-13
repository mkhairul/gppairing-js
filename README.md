# gppairing-js
interface with gppairing middleware

pairings.setUrl('https://clevents-sydney.herokuapp.com/')
pairings.eventPairings('GP KL 2016').then(function(data){
  pairings.createHtmlList('.pairings', data)
})
