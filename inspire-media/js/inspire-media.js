$(function(){

// Dropdown menu
$( "#speed" ).selectmenu();

var AMOUNT = 100;

var container;

var camera, scene, renderer;

var video, image, imageContext,
imageReflection, imageReflectionContext, imageReflectionGradient,
texture, textureReflection;

var mesh;

var mouseX = 0;
var mouseY = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var yOffset = 30;

init();
render();

function init() {

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

	//

	var plane = new THREE.PlaneGeometry( 480, 204, 4, 4 );

	mesh = new THREE.Mesh( plane, material );
	mesh.scale.x = mesh.scale.y = mesh.scale.z = 1.5;
	mesh.position.y = - yOffset;
	scene.add(mesh);

	mesh = new THREE.Mesh( plane, materialReflection );
	mesh.position.y = -306 - yOffset;
	mesh.rotation.x = - Math.PI;
	mesh.scale.x = mesh.scale.y = mesh.scale.z = 1.5;
	scene.add( mesh );

	//

	var separation = 150;
	var amountx = 10;
	var amounty = 10;

	var PI2 = Math.PI * 2;
	var material = new THREE.SpriteCanvasMaterial( {

		color: 0x0808080,
		program: function ( context ) {

			context.beginPath();
			context.arc( 0, 0, 0.5, 0, PI2, true );
			context.fill();

		}

	} );

	for ( var ix = 0; ix < amountx; ix++ ) {

		for ( var iy = 0; iy < amounty; iy++ ) {

			particle = new THREE.Sprite( material );
			particle.position.x = ix * separation - ( ( amountx * separation ) / 2 );
			particle.position.y = -153 - yOffset;
			particle.position.z = iy * separation - ( ( amounty * separation ) / 2 );
			particle.scale.x = particle.scale.y = 2;
			scene.add( particle );

		}

	}

	var loader = new THREE.ImageLoader();

	loader.load(
		'img/logo.png',
		function (image) {
			var imgWidth = $(image)[0].width;
			var imgHeight = $(image)[0].height;

			var logoTexture = new THREE.Texture( image );

			var logoMaterial = new THREE.MeshBasicMaterial( { map: logoTexture, overdraw: 0.5 } );
			
			var logoPlane = new THREE.PlaneGeometry( imgWidth / 2, imgHeight/2, 4, 4 );
			var logo = new THREE.Mesh( logoPlane, logoMaterial );

			logo.position.y = 270;

			scene.add( logo );
		});

	document.addEventListener( 'mousemove', onDocumentMouseMove, false );

	//

	window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {

	windowHalfX = window.innerWidth / 2;
	windowHalfY = window.innerHeight / 2;

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}

function onDocumentMouseMove( event ) {

	mouseX = ( event.clientX - windowHalfX );
	mouseY = ( event.clientY - windowHalfY ) * 0.2;

}

//

function render() {
	requestAnimationFrame( render );

	camera.position.x += ( mouseX - camera.position.x ) * 0.05;
	camera.position.y += ( - mouseY - camera.position.y ) * 0.05;
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
