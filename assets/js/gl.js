var x_from_tessel_A = 0.01;
var y_from_tessel_A = 0.01;
var x_from_tessel_B = 0.01;
var y_from_tessel_B = 0.01;
var z_from_tessel_B = 0.01;
var prev_x = 0.01
var prev_y = 0.01


var socket = io('http://localhost:8000');
socket.on('t_data', function(data) {
    //console.log(data.message.x);

    if (data.message.port === "gpio") {
        if (data.message.event === "release") {
            saveScreenShot();
        }
    }

    if (data.message.port === "A") {
        if (data.message.x !== undefined) {
            x_from_tessel_A = data.message.x;
        }
        if (data.message.y !== undefined) {
            y_from_tessel_A = data.message.y;
        }
    }

    if (data.message.port === "B") {
        if (data.message.x !== undefined) {
            x_from_tessel_B = data.message.x;
        }
        if (data.message.y !== undefined) {
            y_from_tessel_B = data.message.y;
        }
        if (data.message.z !== undefined) {
            z_from_tessel_B = data.message.z;
        }
    }


    //socket.emit('ping', { my: 'hello from client' });
});

socket.on("sc-succ", function(data) {

    if (data.status === 1) {

        document.getElementById("submittedSC").src = "assets/images/cropData.png?g=" + Date.now();
        document.getElementById("submittedSC").className = document.getElementById("submittedSC").className + " show";
    }

});

socket.on("win", function(data) {
    if (data.status === 1) {
        bootbox.alert("WELL DONE!!", function(e) {
            location.reload();
        });
    }
});
socket.emit('ping', {
    my: 'hello from client'
});
socket.on('pong', function(data) {
    console.log(data);

});

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.0001, 100000);

var renderer = new THREE.WebGLRenderer({
    antialias: true,
    preserveDrawingBuffer: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMapEnabled = true
renderer.shadowMapType = THREE.PCFSoftShadowMap;

document.body.appendChild(renderer.domElement);


var onRenderFcts = [];
// var ambient	= new THREE.AmbientLight(0x444444);	
// scene.add( ambient );

// var light	= new THREE.DirectionalLight(0x4444cc, 2);
// light.position.set( 1, -1, 1 ).normalize();
// scene.add( light );

var spotLight = new THREE.SpotLight(0xFFAA88);
spotLight.position.set(100, 1500, 100);
//spotLight.target.position.set( 10, 10, 1 );
spotLight.shadowMapWidth = 1024;
spotLight.shadowMapHeight = 1024;
spotLight.shadowCameraNear = 0.1;
spotLight.castShadow = true;
spotLight.shadowDarkness = 0.5;
// spotLight.shadowCameraVisible = true;
scene.add(spotLight);

onRenderFcts.push(function() {
    var angle = Date.now() / 1000 * Math.PI;
    spotLight.position.x = Math.cos(angle * -0.1) * 20;
    spotLight.position.y = 10 + Math.sin(angle * 0.5) * 6;
    spotLight.position.z = Math.sin(angle * -0.1) * 20;
});

var geometry = new THREE.CubeGeometry(400, 400, 400);
var material = new THREE.MeshBasicMaterial({
    color: 0x9370DB,
    wireframe: true
})

var cube = new THREE.Mesh(geometry, material);
cube.rotation.x += 10;
cube.rotation.y += 10;
scene.add(cube);
cube.castShadow = true;
cube.receiveShadow = false;

var groundGeometry = new THREE.CubeGeometry(5050, 50, 2100, 1, 1, 1);
var groundMaterial = new THREE.MeshBasicMaterial({
    color: 0xFFFFFF
});
var ground = new THREE.Mesh(groundGeometry, groundMaterial);
//ground.scale.multiplyScalar(3);
ground.position.y = -2150 / 2
    //ground.position.z		= 0
    //ground.rotation.x = Math.PI/2;
scene.add(ground);
ground.castShadow = false;
ground.receiveShadow = true;

camera.position.z = 2000;
//camera.position.y = 2000;

var mouse = {
        x: 0,
        y: 0
    }
    // document.addEventListener('mousemove', function(event){
    // 	mouse.x	= (event.clientX / window.innerWidth ) - 0.5
    // 	mouse.y	= (event.clientY / window.innerHeight) - 0.5
    // }, false);
    // onRenderFcts.push(function(delta, now){
    // 	camera.position.x += (mouse.x*40 - camera.position.x) * (delta*3)
    // 	camera.position.y += (mouse.y*10 - camera.position.y + 4) * (delta*3)
    // 	// limit camera position to avoid showing shadow on backface
    // 	camera.position.y	= Math.max(camera.position.y, 3);

// 	camera.lookAt( scene.position )
// });

// onRenderFcts.push(function(){
// 		renderer.render( scene, camera );		
// })

// var lastTimeMsec= null;
// requestAnimationFrame(function animate(nowMsec){
// 	// keep looping
// 	requestAnimationFrame( animate );
// 	// measure time
// 	lastTimeMsec	= lastTimeMsec || nowMsec-1000/60
// 	var deltaMsec	= Math.min(200, nowMsec - lastTimeMsec)
// 	lastTimeMsec	= nowMsec
// 	// call each update function
// 	onRenderFcts.forEach(function(onRenderFct){
// 		onRenderFct(deltaMsec/1000, nowMsec/1000)
// 	})
// });
var lastTimeMsec = null,
    nowMsec = null;



var render = function() {
    requestAnimationFrame(render);

    // cube.rotation.x += 0.01;
    // cube.rotation.y += 0.01;

    if (x_from_tessel_A !== prev_x) {
        cube.rotation.x += x_from_tessel_A / 2;
        prev_x = x_from_tessel_A;
    }


    if (y_from_tessel_A !== prev_y) {
        cube.rotation.y += y_from_tessel_A / 2;
        prev_y = y_from_tessel_A;
    }

    //var angle	= Date.now()/1000 * Math.PI;
    // console.log("B",x_from_tessel_B);
    // console.log("A",x_from_tessel_A);
    var prev_z_B = 0.01;
    if (z_from_tessel_B !== prev_z_B) {
        spotLight.position.z = z_from_tessel_B * Math.PI + spotLight.position.z;
        prev_z_B = z_from_tessel_B;
    }

    //    var angleY = y_from_tessel_B/1000 * Math.PI;

    //    // if (angleX * 10000 * -1 <= 1.0){
    //    	//console.log(angleX * 10000 * -1);
    //    	spotLight.position.x	+= Math.cos(angleX*-0.1)*20;	
    //    // }
    // // if (angleY * 10000 <= 1.0){
    // 	// console.log(angleY * 10000);
    //    	spotLight.position.y	+= 10 + Math.sin(angleY*0.5)*6;
    //}	

    //spotLight.position.z	= Math.sin(angle*-0.1)*20;		


    lastTimeMsec = lastTimeMsec || nowMsec - 1000 / 60
    var deltaMsec = Math.min(200, nowMsec - lastTimeMsec)
    lastTimeMsec = nowMsec

    camera.position.x += (mouse.x * 40 - camera.position.x) * ((deltaMsec / 1000) * 3)
    camera.position.y += (mouse.y * 10 - camera.position.y + 4) * ((deltaMsec / 1000) * 3)
        // limit camera position to avoid showing shadow on backface
    camera.position.y = Math.max(camera.position.y, 3);

    camera.lookAt(scene.position)

    renderer.render(scene, camera);
};

var saveScreenShot = function() {
    var dataURL = THREEx.Screenshot.toDataURL(renderer);
    console.log(dataURL);
    // if (width === undefined && height === undefined) {
    // post to node
    socket.emit('sc', {
        data: dataURL
    });
    // } else {
    //     // resize it and notify the callback
    //     // * resize == async so if callback is a window open, it triggers the pop blocker
    //     _aspectResize(dataUrl, width, height, callback);
    // }
}



render();
