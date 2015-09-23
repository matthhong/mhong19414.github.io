$(function(){

// DROPDOWN MENU
$( "#speed" ).selectmenu();

// PLAY/PAUSE (for some reason, toggle() was bugging)
$("#logo-play")
	.on('click', function(){
		$(this).hide();
		$("#logo-pause").show();
	});
$("#logo-pause")
	.on('click', function(){
		$(this).hide();
		$("#logo-play").show();
	});

// THREE.JS
var container;

var camera, scene, renderer;

var video, image, imageContext,
imageReflection, imageReflectionContext, imageReflectionGradient,
texture, textureReflection;

var light;

var particleMaterials = [];

var imageWidth = 960, imageHeight = 635;

var mesh;

var mouse = new THREE.Vector2();

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

// Screen and logo position
var xOffset = 174;
var yOffset = 12;
var zOffset = -60;

var particlesY = -363;

init();
render();

function init() {

	// SETUP
	container = document.createElement( 'div' );
	document.body.appendChild( container );

	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );
	camera.position.z = 1000;

	scene = new THREE.Scene();

	renderer = new THREE.CanvasRenderer();
	renderer.setClearColor( 0x363636 );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	container.appendChild( renderer.domElement );

	// LIGHTING
	// light = new THREE.SpotLight(0xffffff,500);

	// light.position.set( 0, 500, 0 );

	// light.castShadow = true;

	// light.shadowMapWidth = 1024;
	// light.shadowMapHeight = 1024;

	// light.shadowCameraNear = 500;
	// light.shadowCameraFar = 4000;
	// light.shadowCameraFov = 30;

	// scene.add(light);

// 	var hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
// 				hemiLight.color.setHSL( 0.6, 1, 0.6 );
// 				hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
// 				hemiLight.position.set( 0, 500, 0 );
// 				scene.add( hemiLight );

// 	light1 = new THREE.PointLight( 0xff0040, 1, 5000 );
// light1.position.set( 500, 500, 500 );
// scene.add(light1)

	// SCREEN
	var loader = new THREE.ImageLoader();

	loader.load('img/eric.jpg', function(image){
		video = image;
	})
	// video = document.getElementById( 'video' );

	image = document.createElement( 'canvas' );
	image.width = imageWidth;
	image.height = imageHeight;

	imageContext = image.getContext( '2d' );
	imageContext.fillStyle = '#000000';
	imageContext.fillRect( 0, 0, imageWidth, imageHeight );

	texture = new THREE.Texture( image);

	var material = new THREE.MeshBasicMaterial( { map: texture, overdraw:0.5 } );

	imageReflection = document.createElement( 'canvas' );
	imageReflection.width = imageWidth;
	imageReflection.height = imageHeight;

	imageReflectionContext = imageReflection.getContext( '2d' );
	imageReflectionContext.fillStyle = '#000000';
	imageReflectionContext.fillRect( 0, 0, imageWidth, imageHeight );

	imageReflectionGradient = imageReflectionContext.createLinearGradient( 0, 0, 0, imageHeight );
	imageReflectionGradient.addColorStop( 0.2, 'rgba(48, 48, 48, 1)' );
	imageReflectionGradient.addColorStop( 1, 'rgba(48, 48, 48, 0.8)' );

	textureReflection = new THREE.Texture( imageReflection );

	var materialReflection = new THREE.MeshBasicMaterial( { map: textureReflection, side: THREE.BackSide, overdraw: 0.5 } );

	var planeW = 1000;
	var plane = new THREE.PlaneGeometry( planeW, planeW*3/4, 4, 4 );

	mesh = new THREE.Mesh( plane, material );
	// mesh.scale.x = mesh.scale.y = mesh.scale.z = 1.5;
	mesh.position.x = xOffset;
	mesh.position.y = yOffset;
	mesh.position.z = zOffset;
	scene.add(mesh);

	// spotlight.target = mesh.position;

	mesh = new THREE.Mesh( plane, materialReflection );
	mesh.position.x = xOffset;
	mesh.position.y = particlesY*2 - 12;
	mesh.position.z = zOffset;
	mesh.rotation.x = - Math.PI;
	// mesh.scale.x = mesh.scale.y = mesh.scale.z = 1.5;
	scene.add( mesh );

	// PARTICLES
	var separation = 150;
	var amountx = 30;
	var amounty = 30;

	var PI2 = Math.PI * 2;
	var material1 = new THREE.SpriteCanvasMaterial( {

		color: 0x0ffffff,
		program: function ( context ) {

			context.beginPath();
			context.arc( 0, 0, 0.5, 0, PI2, true );
			context.fill();

		}

	} );

	var material2 = new THREE.SpriteCanvasMaterial( {

		color: 0x0253B94,
		program: function ( context ) {

			context.beginPath();
			context.arc( 0, 0, 0.5, 0, PI2, true );
			context.fill();

		}

	} );

	for ( var ix = 0; ix < amountx; ix++ ) {

		for ( var iy = 0; iy < amounty; iy++ ) {
			if (ix % 2 == 0){
				particle = new THREE.Sprite( material1 );
			} else {
				particle = new THREE.Sprite( material2 );
			}
			particle.position.x = ix * separation - ( ( amountx * separation ) / 2 );
			particle.position.y = particlesY;
			particle.position.z = iy * separation - ( ( amounty * separation ) / 2 );
			particle.scale.x = particle.scale.y = 8;
			scene.add( particle );

		}

	}

	// GROUND 

	// var planeGeo = new THREE.PlaneBufferGeometry( 1000, 1000, 4, 4 );

	// var mirrorCamera = new THREE.Camera();
	// // mirrorCamera.lookAt
	// scene.add(mirrorCamera);
	// var mirrorMaterial = new THREE.MeshLambertMaterial( { emissive: 0xffffff, envMap: mirrorCamera.renderTarget } );

	// mesh = new THREE.Mesh( planeGeo, mirrorMaterial );

	// mesh.rotation.x = Math.PI/2;

	// mesh.position.y = -100;

	// scene.add(mesh);

	// var planeGeo = new THREE.PlaneBufferGeometry( 100.1, 100.1 );

	// // MIRROR planes
	// var groundMirror = new THREE.Mirror( 
	// 	renderer, 
	// 	camera, 
	// 	{ 
	// 		clipBias: 0.003, 
	// 		textureWidth: window.innerWidth, 
	// 		textureHeight: window.innerHeight, 
	// 		color: 0x777777 
	// 	});

	// var mirrorMesh = new THREE.Mesh( planeGeo, groundMirror.material );
	// mirrorMesh.add( groundMirror );
	// mirrorMesh.rotateX( - Math.PI / 2 );
	// scene.add( mirrorMesh );

	// groundMirror.render();


	// LOGO
	// var loader = new THREE.ImageLoader();

	// loader.load(
	// 	'img/logo.png',
	// 	function (image) {
	// 		var imgWidth = $(image)[0].width;
	// 		var imgHeight = $(image)[0].height;

	// 		var logoTexture = new THREE.Texture( image );

	// 		var logoMaterial = new THREE.MeshBasicMaterial( { map: logoTexture, overdraw: 0.5 } );
			
	// 		var logoPlane = new THREE.PlaneBufferGeometry( imgWidth / 1.6, imgHeight/1.6, 4, 4 );
	// 		var logo = new THREE.Mesh( logoPlane, logoMaterial );

	// 		logo.position.x = xOffset;
	// 		logo.position.y = 294;
	// 		mesh.position.z = zOffset;

	// 		scene.add( logo );
	// 	});


	document.addEventListener( 'mousemove', onDocumentMouseMove, false );

	window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {

	windowHalfX = window.innerWidth / 2;
	windowHalfY = window.innerHeight / 2;

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}

function onDocumentMouseMove( e ) {

	mouse.x = ( e.clientX - windowHalfX );
	mouse.y = ( e.clientY - windowHalfY ) * 0.2;

}

function render() {
	requestAnimationFrame( render );

	// groundMirror.render();

	camera.position.x += ( mouse.x - camera.position.x ) * 0.05;
	camera.position.y += ( - mouse.y - camera.position.y ) * 0.05;
	camera.lookAt( scene.position );

	// if ( video.readyState === video.HAVE_ENOUGH_DATA ) {

		imageContext.drawImage( video, 0, 0, 960, 635 );
		// console.log(video)

	// 	if ( texture ) texture.needsUpdate = true;
	// 	if ( textureReflection ) textureReflection.needsUpdate = true;

	// }

	imageReflectionContext.drawImage( image, 0, 0 );
	imageReflectionContext.fillStyle = imageReflectionGradient;
	imageReflectionContext.fillRect( 0, 0, imageWidth, imageHeight );
	renderer.render( scene, camera );

}

});
