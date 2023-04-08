
let cartData;
//const destination = {lat: 35.61362, lng: -82.56101};
var currentLocation;
var cartID = -1;
//if someone has the cart on there map but they have not clicked reserve cart
var inCart = false;
var reserved = false;
var routeCount = 0;
var directionsRenderer1;
var directionsRenderer2;

async function queryData(){
  const response = await fetch('./query.php/');
  const data = await response.json();
  //console.log(data);
  let fullArr = data.split('|');
  //cartData = fullArr;
  console.log(fullArr);
  for(let i=0; i<fullArr.length; i++){
      fullArr[i] = fullArr[i].split(':');
      //convert the numbers in the first 7 into 
      for(let j=0;j<fullArr[i].length-1;j++){
              fullArr[i][j] = + fullArr[i][j];
      }
  }
  //removes the last item from the array because it it blank
  fullArr.pop()
  //updateTable(fullArr);   
  cartData = fullArr;
  return fullArr;
 
}


//allows me to print the loop for queryData()
/*async function queryLoop(){
  let data = await queryData();
  console.log(data);
  return data;
}*/

function reserveCart(boolean){
  //console.log(cartData);
  try{
    queryData();
    const xhttp = new XMLHttpRequest();
    xhttp.open("GET", "reserved.php?q="+cartID+"|"+boolean);
    cartData[cartID-1][8] = boolean;
    xhttp.send();
    console.log("loginVal() Finished", xhttp);
    reserved = boolean;
  }catch{
    alert("that cart is no longer avalible.");
    console.log("ERROR: issue with reserve Cart function");
  }
}

const checkIfUsed = async()=>{
  //currently only check for changes in the carts speed
  queryData();
  for(let i = 0; i < cartData.length; i++){
    if(cartData[i][7] > 1){
      cartData[i][8] = true;
      try{
        cart = i+1;
        const xhttp = new XMLHttpRequest();
        xhttp.open("GET", "reserved.php?q="+cart+"|"+true);
        cartData[i][8] = true;
        xhttp.send();
        console.log("loginVal() Finished", xhttp);
      }catch{
        console.log("ERROR: issue with reserve Cart function");
      }
    }
  }
}

//called to find the distance bewteen 2 points on the map
async function cartDistance(cart) {
  
  var userLat = currentLocation.lat;
  var userLng = currentLocation.lng;
  var cartLat = cart.lat;
  var cartLng = cart.lng;
  var R = 3958.8; // Radius of the Earth in miles
  var rlat1 =  userLat* (Math.PI/180); // Convert degrees to radians
  var rlat2 = cartLat * (Math.PI/180); // Convert degrees to radians
  var difflat = rlat2-rlat1; // Radian difference (latitudes)
  var difflon = (cartLng-userLng) * (Math.PI/180); // Radian difference (longitudes)

  var d = 2 * R * Math.asin(Math.sqrt(Math.sin(difflat/2)*Math.sin(difflat/2)+Math.cos(rlat1)*Math.cos(rlat2)*Math.sin(difflon/2)*Math.sin(difflon/2)));
  console.log("return  data: ",d);
  return d;
}

const getNearestCart = async() =>{
  if(inCart == true){
    inCart = false;
    resetMap();
  }
  console.log(cartData);
  var curr;
  var currCart;
  var length = 0;
  //iderate through the vehicles
  for(let i = 0; i < cartData.length; i++){
    if(cartData[i][8] === 'f'){
      var longitude = cartData[i][4];
      var lattitude = cartData[i][5];
      var end = {
        lat: lattitude, 
        lng: longitude
      };
      var distance = 0;
      distance = cartDistance(end);
     
      if(distance < length || i === 0){
        length = distance; 
        curr = end;
        currCart = cartData[i];
      }

    }

  } 
  try{
    cartID = currCart[0];
    console.log(curr);
    return curr;
  }catch{
    alert("Unfortunatly, there are no cart avalible at this time.");
    resetMap();
  }
}

function makeMarker( position, icon, title ) {
  new google.maps.Marker({
   position: position,
   map: map,
   icon: icon,
   title: title
  });
 }

async function getDestination(map, start, end, boolean){
  let newStart = start;
  let newEnd = end;
  let directionsRenderer;
  if(boolean == false){
    newEnd = await newEnd;
    directionsRenderer = directionsRenderer1;
  }else if(boolean == true){
    newStart = await newStart;
    directionsRenderer = directionsRenderer2
  }
  
  const directionsService = new google.maps.DirectionsService();
  directionsService.route({
    origin: newStart,
    destination: newEnd,
    travelMode: 'WALKING'
  })
  .then((response) => {
    directionsRenderer.setDirections(response);
  })

  .catch((e)=> console.log("Direction request failed"+status));
  directionsRenderer.setMap(map);

}

const searchBar = async(map, autocomplete, infowindow) =>{
  var place;
  autocomplete.addListener('place_changed', function() {
    infowindow.close();
    place = autocomplete.getPlace();
    if (!place.geometry) {
        window.alert("Autocomplete's returned place contains no geometry");
        return;
    }
    const destination = {lat: place.geometry.location.lat(), lng:  place.geometry.location.lng()};
    let cart = getNearestCart();
    console.log(cart);
    if(inCart == true){
      resetMap();
    }
    inCart = true;
    directionsRenderer1 = new google.maps.DirectionsRenderer();
    directionsRenderer2 = new google.maps.DirectionsRenderer();
    getDestination(map, currentLocation, cart, false);
    getDestination(map, cart, destination, true);
    
  });
  
 
  
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(
    browserHasGeolocation
      ? "Error: The Geolocation service failed."
      : "Error: Your browser doesn't support geolocation."
  );
  infoWindow.open(map);
}

function resetMap(){
  inCart = false;
  if(reserved == true){
    reserveCart(false);
  }
  cartID = -1;
  const reserveButton = document.getElementById("reserveButton");
  reserveButton.textContent = "Reserve Cart";
  try{
    directionsRenderer1.setMap(null);
    directionsRenderer2.setMap(null);
  }catch{
    directionsRenderer1.setMap(null);
  }
  console.log(cartData);
}

function drawCurrLocation(userMarker){
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        currentLocation = pos;
        //console.log("data of my locations",pos);
      }
      
    );
    //console.log("test test 1", position);
  
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }
  //console.log("test test 2", currentLocation);
  userMarker.setPosition(currentLocation);
}


//button that just gets the nearest cart
function createCartButton(map){
  const cartButton = document.createElement("button");
  cartButton.style.backgroundColor = "#fff";
  cartButton.style.border = "2px solid #fff";
  cartButton.style.borderRadius = "3px";
  cartButton.style.boxShadow = "0 2px 6px rgba(0,0,0,.3)";
  cartButton.style.width= "100px";
  cartButton.style.color = "rgb(25,25,25)";
  cartButton.style.cursor = "pointer";
  cartButton.style.fontFamily = "Roboto,Arial,sans-serif";
  cartButton.style.fontSize = "16px";
  cartButton.style.lineHeight = "34px";
  cartButton.style.marginRight = "10px";
  cartButton.style.marginTop = "10px";
  cartButton.style.textAlign = "center";
  cartButton.textContent = "Find cart ";
  cartButton.title = "Click to find Nearest Cart";
  cartButton.type = "button";

  cartButton.addEventListener("click", () =>{
    //console.log(cartData);
    var cart = getNearestCart();
    if(inCart == true){
      resetMap();
    }
    inCart = true;
    directionsRenderer1 = new google.maps.DirectionsRenderer();
    getDestination(map, currentLocation, cart, false);
  });

  return cartButton;
}

//button that resets the map
function createResetButton(){
  const resetButton = document.createElement("button");
  resetButton.style.backgroundColor = "#fff";
  resetButton.style.border = "2px solid #fff";
  resetButton.style.borderRadius = "3px";
  resetButton.style.width= "100px";
  resetButton.style.boxShadow = "0 2px 6px rgba(0,0,0,.3)";
  resetButton.style.color = "rgb(25,25,25)";
  resetButton.style.cursor = "pointer";
  resetButton.style.fontFamily = "Roboto,Arial,sans-serif";
  resetButton.style.fontSize = "16px";
  resetButton.style.lineHeight = "34px";
  resetButton.style.marginRight = "10px";
  resetButton.style.padding = "0 ";
  resetButton.style.textAlign = "center";
  resetButton.textContent = "Reset Map";
  resetButton.title = "Click to find Nearest Cart";
  resetButton.type = "button";

  resetButton.addEventListener("click", () =>{
    resetMap();
  });

  return resetButton;
}

//button that reserved the current cart you are looking at
function createReserveButton(){

  const reserveButton = document.createElement("button");
  reserveButton.style.backgroundColor = "#fff";
  reserveButton.style.border = "2px solid #fff";
  reserveButton.style.borderRadius = "3px";
  reserveButton.style.width= "100px";
  reserveButton.style.boxShadow = "0 2px 6px rgba(0,0,0,.3)";
  reserveButton.style.color = "rgb(25,25,25)";
  reserveButton.style.fontFamily = "Roboto,Arial,sans-serif";
  reserveButton.style.fontSize = "16px";
  reserveButton.style.lineHeight = "34px";
  reserveButton.style.marginRight = "10px";
  reserveButton.style.padding = "0 ";
  reserveButton.style.textAlign = "center";
  reserveButton.textContent = "Reserve Cart";
  reserveButton.title = "";
  reserveButton.type = "button";
  reserveButton.id = "reserveButton";

  reserveButton.addEventListener("click", () =>{
    console.log("clicked reserve button");
    console.log(cartData[cartID]);
    if(cartID == -1){
      alert("you do not currently have a cart routed");
      return;
    }
    if(reserved == true){
      reserveButton.textContent = "Reserve Cart";
      reserveCart(false);
      return;
    }
    console.log("print print");
    reserveCart(true);
    reserveButton.textContent = "Un-reserve Cart";
  });

  return reserveButton;
}

async function initMap (){
  //sets the global variables too blank
  //continiously updates the data for the cart location
  //initial queryData call
  queryData();
  setInterval(queryData, 5000);

  const unca = {lat: 35.616112 , lng: -82.564629};
  const map = new google.maps.Map(document.getElementById("map"),{
      zoom: 16,
      center: unca
  });

//auto complease data
  var input = document.getElementById('searchInput');
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
  var autocomplete = new google.maps.places.Autocomplete(input);
  autocomplete.bindTo('bounds', map);
  var infowindow = new google.maps.InfoWindow();
  searchBar(map, autocomplete, infowindow);
  document.getElementById("searchInput").style.visibility = "visible";

  //calls function that creates a button that makes route to nearest cart
  const cartButtonDiv = document.createElement("div");
  cartButtonDiv.appendChild(createCartButton(map));
  map.controls[google.maps.ControlPosition.TOP_RIGHT].push(cartButtonDiv);

//calls function that creates a button that makes route to nearest cart
  const resetButtonDiv = document.createElement("div");
  resetButtonDiv.appendChild(createResetButton());
  map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(resetButtonDiv);

//calls function that creates a button that reserves the cart on the current route
  const reserveButtonDiv = document.createElement("div");
  reserveButtonDiv.appendChild(createReserveButton());
  map.controls[google.maps.ControlPosition.RIGHT_TOP].push(reserveButtonDiv);

//creates marker for intial user postition
  const userMarker = new google.maps.Marker({
    position: currentLocation,
    map: map
  });
//calls the initial function to draw user locatio then does it every second
  drawCurrLocation(userMarker);
  setInterval(drawCurrLocation, 1000, userMarker);
  
//calls the intiialy funtion to check other variable to see if the cart is running but the driver did not tell the app then calls it again every second
  checkIfUsed();
  setInterval(checkIfUsed, 1000);

}