import {  MDBFile } from 'mdb-react-ui-kit';
import * as PANOLENS from "panolens";
import * as THREE from 'three';
import { useEffect, useState, useRef } from 'react';
import UploadFiles from './upload-files.component';

import { OrbitControls } from "./OrbitControls.js";
import { OrbitControlsGizmo } from "./OrbitControlsGizmo.js";

// Focus tweening parameter
const parameters = {
  amount: 50,
  duration: 1000,
  curve: 'Exponential',
  easing: 'Out',
  iterative: false
};

const baseScale = 2;

console.log(PANOLENS);
let panorama = new PANOLENS.ImagePanorama("/assets/test (2).jpg");
console.log(panorama);

var viewer;
var geometry = new THREE.Geometry();
var lines;

var posArray = [];
var polygonArray = [];
var linesArray = [];

var linesPolygonObject = [];
var linesObject = [];

var status = {
  POLYGON: false,
  LINE: false
}

const Pano = () => {

  const [url, setUrl] = useState('');
  const [isNew, setIsNew] = useState(false);
  const [isPolygon, setIsPolygon] = useState(false);
  const [isLine, setIsLine] = useState(false);
  const [isText, setIsText] = useState(false);


  const pano = useRef(null);

  const upload = (file) => {
    console.log(file.name)

    initPano(file.name);

    setIsNew(false);
  }

  const drawLine = (pos) => {

      if(!status.LINE) return;

      if (window.event.ctrlKey) {

        //ctrl was held down during the click
        if(lines != undefined) {
          viewer.remove(lines);
        }
        if(posArray.length > 1) {
          posArray[1] = pos;
        } else {
          posArray.push(pos)
        }
        const pArray = [...posArray];

        geometry = new THREE.BufferGeometry().setFromPoints(pArray);
        // lines
        var matLines = new THREE.LineBasicMaterial({color: "blue"});
        lines = new THREE.LineLoop(geometry, matLines);
        viewer.add(lines);

      }

  }

  const drawPolygon = (pos) => {

    console.log(pos, status.POLYGON)
    if(!status.POLYGON) return;

    if (window.event.ctrlKey) {
      //ctrl was held down during the click
      if(lines != undefined) {
        viewer.remove(lines);
      }
      posArray.push(pos)
      const pArray = [...posArray];

      // Remove center vertex

      geometry = new THREE.BufferGeometry().setFromPoints(pArray);
      // lines
      var matLines = new THREE.LineBasicMaterial({color: "yellow"});
      lines = new THREE.LineLoop(geometry, matLines);
      viewer.add(lines);
    }

  }

  const addPolygonObject = () => {
        //ctrl was held down during the click

        const pArray = [...posArray];

        geometry = new THREE.BufferGeometry().setFromPoints(pArray);
        // lines
        var matLines = new THREE.LineBasicMaterial({color: "yellow"});
        const lines1 = new THREE.LineLoop(geometry, matLines);
        linesPolygonObject.push(lines1);
        viewer.add(lines1);
  }

  const addLineObject = () => {
    //ctrl was held down during the click

    const pArray = [...posArray];

    geometry = new THREE.BufferGeometry().setFromPoints(pArray);
    // lines
    var matLines = new THREE.LineBasicMaterial({color: "blue"});
    const lines1 = new THREE.LineLoop(geometry, matLines);
    linesObject.push(lines1);
    viewer.add(lines1);
  }

  // const drawMove = pos => {
  //   if (window.event.ctrlKey) {
  //     if(lines != undefined) {
  //       viewer.remove(lines);
  //     }
  //     geometry = new THREE.BufferGeometry().setFromPoints(posArray.concat(pos));
  //     // lines
  //     var matLines = new THREE.LineBasicMaterial({color: "yellow"});
  //     lines = new THREE.LineLoop(geometry, matLines);
  //     viewer.add(lines);
  //   }
  // }

  const initPano = (url) => {
    panorama && panorama.dispose() && viewer.remove( panorama );

    posArray = [];

    panorama = new PANOLENS.ImagePanorama(`assets/${url}`);

    panorama.addEventListener("click", function(e){
      if (e.intersects.length > 0) return;
      const a = viewer.raycaster.intersectObject(viewer.panorama, true)[0].point;
      drawPolygon(a);
      drawLine(a);
    });

    // panorama.addEventListener("mousemove", function(e) {
    //   if (e.intersects.length > 0) return;
    //   const a = viewer.raycaster.intersectObject(viewer.panorama, true)[0].point;
    //   console.log("-------mouse move")
    //   drawMove(a)
    // })

    if(viewer == undefined) {
      viewer = new PANOLENS.Viewer({
        container: document.querySelector("#coucou")
      });

      // window.addEventListener('mouseup', onPointerDown);

      // viewer.camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 10000 );
      // viewer.camera.position.set( 15, 12, 12 );

      // // Orbit Controls
      // const controls = new OrbitControls( viewer.camera, document.querySelector("#coucou") );

      // // Obit Controls Gizmo
      // const controlsGizmo = new OrbitControlsGizmo(controls, { size: 100, padding: 8 });

      // // Add the Gizmo to the document
      // document.body.appendChild(controlsGizmo.domElement);

      // Grid Helper
      // viewer.add(new THREE.GridHelper(10, 10, "#666666", "#222222"));

      viewer.getCamera().fov = 120;
      viewer.getCamera().updateProjectionMatrix();

    } else {
      const scene = viewer.getScene()
      for( var i = scene.children.length - 1; i >= 0; i--) { 
        const obj = scene.children[i];
        scene.remove(obj); 
      }
    }

    viewer.add(panorama);

    // var dotGeometry = new THREE.Geometry();
    // dotGeometry.vertices.push(new THREE.Vector3( 0, 0, 0));
    // var dotMaterial = new THREE.PointsMaterial( { size: 50, sizeAttenuation: false } );
    // var dot = new THREE.Points( dotGeometry, dotMaterial );
    // viewer.add( dot );

  }

  const onPolygon = () => {

    if(posArray.length > 0) {
      if(status.POLYGON) {
        addPolygonObject();
      } else {
        initDraw();
      }

      polygonArray.push(posArray);
      posArray = [];
    }

    status.POLYGON = !isPolygon;
    status.LINE = false;
    setIsPolygon(!isPolygon);
    setIsLine(false)
  }

  const onLine = () => {
    if(posArray.length > 0) {
      if(status.LINE) {
        addLineObject();
      } else {
        initDraw();
      }

      linesArray.push(posArray);
      posArray = [];
    }

    status.LINE = !isLine;
    status.POLYGON = false;
    setIsLine(!isLine);
    setIsPolygon(false)
  }

  const initDraw = () => {
    if(lines != undefined) {
      viewer.remove(lines);
    }
  }

  useEffect(() => {

  }, [pano])

  return (
    <>


      <div className='control-div'>
        <div className='btn btn-success' onClick={() => {
          setIsNew(!isNew);
        }}>New</div>
        <div className={`btn btn-${isPolygon?'success' : 'info'}`} onClick={onPolygon.bind(this)}>PLG</div>
        <div className={`btn btn-${isLine?'success' : 'info'}`} onClick={onLine.bind(this)}>Line</div>
        {/* <div className={`btn btn-${isText?'success' : 'info'}`} onClick={onLine.bind(this)}>Text</div> */}
      </div>

      <div className='coucou' ref={pano} id="coucou">
          {isNew && <div className="coucou-new">
            <UploadFiles uploadFile={upload} />
          </div>}
      </div>
    </>
  );
};

export default Pano;
