var UI = require('ui');
var Accel = require('ui/accel');
var Vector2 = require('vector2');

var main = new UI.Window();
var circle = new UI.Circle({
  position: new Vector2(72, 84),
  radius: 40,
  backgroundColor: 'orange'
});
var conText = new UI.Text({
  text: "ERROR: Disconnected!",
  textAlign: 'center',
  position: new Vector2(0, 140),
  size: new Vector2(144, 168)
});
main.add(circle);
main.add(conText);
main.add(new UI.Text({
  text: "Pebble Drawer",
  textAlign: 'center',
  position: new Vector2(0, 0),
  size: new Vector2(144, 168)
}));

var ws = connect();
var connected = false;

var nextPacket = {
  "x": 0,
  "y": 0,
  "z": 0,
  "tapped": false,
  "click_up": false,
  "click_select": false,
  "click_down": false,
  "click_back": false
};

main.show();

Accel.on('data', function(e) {
  if(connected) {
    var x = 0;
    var y = 0;
    var z = 0;
    var accels = e.accels;
    for(var i = 0; i < 25; i++) {
      x -= accels[i].y;
      y += accels[i].x;
      z += accels[i].z;
    }
    nextPacket.x = x/25;
    nextPacket.y = y/25;
    nextPacket.z = z/25;
    var json = JSON.stringify(nextPacket);
    console.log(json);
    ws.send(json);
  } else {
    ws = connect();
  }
  nextPacket = {
    "x": 0,
    "y": 0,
    "z": 0,
    "tapped": false,
    "click_up": false,
    "click_select": false,
    "click_down": false,
    "click_back": false
  };
});

Accel.on('tap', function(e) {
  nextPacket.tapped = true;
});

main.on('click', 'up', function(e) {
  nextPacket.click_up = true;
});

main.on('click', 'select', function(e) {
  nextPacket.click_select = true;
});

main.on('click', 'down', function(e) {
  nextPacket.click_down = true;
});

main.on('click', 'back', function(e) {
  nextPacket.click_back = true;
});

function rgb(hue) {
  var x = 255 * (1 - Math.abs(hue/60.0 % 2 - 1));
  if(hue < 60)
    return "#ff" + toHex(x) + "00";
  if(hue < 120)
    return "#" + toHex(x) + "ff00";
  if(hue < 180)
    return "#00ff" + toHex(x);
  if(hue < 240)
    return "#00" + toHex(x) + "ff";
  if(hue < 300)
    return "#" + toHex(x) + "00ff";
  return "#ff00" + toHex(x);
}

function toHex(val) {
  return ('00' + val.toString(16)).slice(-2);
}

function connect() {
  var ws = new WebSocket("ws://mazeika.me:8080/ws/pebble?token=wths");
  ws.onopen = function(event) {
    connected = true;
    conText.remove();
  };

  ws.onclose = function(event) {
    connected = false;
    main.add(conText);
  };
  
  ws.onmessage = function(message) {
    var color = rgb(JSON.parse(message.data).hue);
    circle.backgroundColor(color);
  };
  
  return ws;
}