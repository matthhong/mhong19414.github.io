$(function(){

// DROPDOWN MENU
$( "#speed" ).selectmenu();

// THREE.JS
var container;

var camera, scene, renderer;

var video, image, imageContext,
imageReflection, imageReflectionContext, imageReflectionGradient,
texture, textureReflection;

var mesh;

var mouse = new THREE.Vector2();

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

// Screen and logo position
var xOffset = 162;
var yOffset = -57;
var zOffset = -60;

var particlesY = -339;

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
	renderer.setClearColor( 0xf0f0f0 );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	container.appendChild( renderer.domElement );

	// SCREEN
	video = document.getElementById( 'video' );

	image = document.createElement( 'canvas' );
	image.width = 480;
	image.height = 204;

	imageContext = image.getContext( '2d' );
	imageContext.fillStyle = '#000000';
	imageContext.fillRect( 0, 0, 480, 204 );

	texture = new THREE.Texture( image );

	var material = new THREE.MeshBasicMaterial( { map: texture, overdraw: 0.5 } );

	imageReflection = document.createElement( 'canvas' );
	imageReflection.width = 480;
	imageReflection.height = 204;

	imageReflectionContext = imageReflection.getContext( '2d' );
	imageReflectionContext.fillStyle = '#000000';
	imageReflectionContext.fillRect( 0, 0, 480, 204 );

	imageReflectionGradient = imageReflectionContext.createLinearGradient( 0, 0, 0, 204 );
	imageReflectionGradient.addColorStop( 0.2, 'rgba(240, 240, 240, 1)' );
	imageReflectionGradient.addColorStop( 1, 'rgba(240, 240, 240, 0.8)' );

	textureReflection = new THREE.Texture( imageReflection );

	var materialReflection = new THREE.MeshBasicMaterial( { map: textureReflection, side: THREE.BackSide, overdraw: 0.5 } );

	var plane = new THREE.PlaneGeometry( 500, 375, 4, 4 );

	mesh = new THREE.Mesh( plane, material );
	mesh.scale.x = mesh.scale.y = mesh.scale.z = 1.5;
	mesh.position.x = xOffset;
	mesh.position.y = yOffset;
	mesh.position.z = zOffset;
	scene.add(mesh);

	mesh = new THREE.Mesh( plane, materialReflection );
	mesh.position.x = xOffset;
	mesh.position.y = particlesY * 2 - yOffset;
	mesh.position.z = zOffset;
	mesh.rotation.x = - Math.PI;
	mesh.scale.x = mesh.scale.y = mesh.scale.z = 1.5;
	scene.add( mesh );

	// PARTICLES
	var separation = 150;
	var amountx = 20;
	var amounty = 20;

	var PI2 = Math.PI * 2;
	var material1 = new THREE.SpriteCanvasMaterial( {

		color: 0x07ec0ee,
		program: function ( context ) {

			context.beginPath();
			context.arc( 0, 0, 0.5, 0, PI2, true );
			context.fill();

		}

	} );

	var material2 = new THREE.SpriteCanvasMaterial( {

		color: 0x0800080,
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
			particle.scale.x = particle.scale.y = 6;
			scene.add( particle );

		}

	}

	// LOGO
	var loader = new THREE.ImageLoader();

	loader.load(
		'img/logo.png',
		function (image) {
			var imgWidth = $(image)[0].width;
			var imgHeight = $(image)[0].height;

			var logoTexture = new THREE.Texture( image );

			var logoMaterial = new THREE.MeshBasicMaterial( { map: logoTexture, overdraw: 0.5 } );
			
			var logoPlane = new THREE.PlaneBufferGeometry( imgWidth / 1.6, imgHeight/1.6, 4, 4 );
			var logo = new THREE.Mesh( logoPlane, logoMaterial );

			logo.position.x = xOffset;
			logo.position.y = 294;
			mesh.position.z = zOffset;

			scene.add( logo );
		});


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

	camera.position.x += ( mouse.x - camera.position.x ) * 0.05;
	camera.position.y += ( - mouse.y - camera.position.y ) * 0.05;
	camera.lookAt( scene.position );

	if ( video.readyState === video.HAVE_ENOUGH_DATA ) {

		imageContext.drawImage( video, 0, 0 );

		if ( texture ) texture.needsUpdate = true;
		if ( textureReflection ) textureReflection.needsUpdate = true;

	}

	imageReflectionContext.drawImage( image, 0, 0 );
	imageReflectionContext.fillStyle = imageReflectionGradient;
	imageReflectionContext.fillRect( 0, 0, 480, 204 );
	renderer.render( scene, camera );

}

});
