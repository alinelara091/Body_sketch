let video;
let bodyPose;
let poses = [];
let connections;
let painting;

let angle = 0; // Rotación del círculo

// Arrays para los rastros de los ojos
let leftEyeTrail = [];
let rightEyeTrail = [];

function preload() {
  bodyPose = ml5.bodyPose({flipped: true});
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  painting = createGraphics(windowWidth, windowHeight);
  painting.clear();

  video = createCapture(VIDEO, {flipped: true});
  video.size(windowWidth, windowHeight);
  video.hide();

  bodyPose.detectStart(video, gotPoses);
  connections = bodyPose.getSkeleton();
}

function gotPoses(results) {
  poses = results;
}

function draw() {
  background(0);

  // Simular efecto "rayos X" con un filtro azul verdoso
  push();
  tint(0, 255, 255, 100); // Azul verdoso translúcido
  image(video, 0, 0, width, height);
  pop();

  let handDistance = 0;

  for (let i = 0; i < poses.length; i++) {
    let pose = poses[i];

    // Dibujar conexiones del esqueleto con estilo rayos X
    for (let j = 0; j < connections.length; j++) {
      let a = pose.keypoints[connections[j][0]];
      let b = pose.keypoints[connections[j][1]];
      if (a.confidence > 0.1 && b.confidence > 0.1) {
        stroke(0, 255, 255); // Azul eléctrico
        strokeWeight(2);
        line(a.x, a.y, b.x, b.y);
      }
    }

    let leftHand = pose.keypoints[9];  // mano izquierda
    let rightHand = pose.keypoints[10]; // mano derecha

    // Dibujar círculos en las manos con un color rayos X
    if (leftHand.confidence > 0.1) {
      noStroke();
      fill(0, 255, 255);
      ellipse(leftHand.x, leftHand.y, 20);
    }

    if (rightHand.confidence > 0.1) {
      noStroke();
      fill(0, 255, 255);
      ellipse(rightHand.x, rightHand.y, 20);
    }

    // Dibujar puntos de los ojos y generar rastro
    let leftEye = pose.keypoints[1]; // Ojo izquierdo
    let rightEye = pose.keypoints[2]; // Ojo derecho

    if (leftEye.confidence > 0.1) {
      // Agregar la posición al rastro de ojo izquierdo
      leftEyeTrail.push({ x: leftEye.x, y: leftEye.y });
      // Limitar el tamaño del rastro
      if (leftEyeTrail.length > 30) {
        leftEyeTrail.shift(); // Eliminar la posición más antigua
      }
    }

    if (rightEye.confidence > 0.1) {
      // Agregar la posición al rastro de ojo derecho
      rightEyeTrail.push({ x: rightEye.x, y: rightEye.y });
      // Limitar el tamaño del rastro
      if (rightEyeTrail.length > 30) {
        rightEyeTrail.shift(); // Eliminar la posición más antigua
      }
    }

    // Dibujar el rastro de los ojos
    for (let i = 0; i < leftEyeTrail.length; i++) {
      let alpha = map(i, 0, leftEyeTrail.length, 0, 255);
      noStroke();
      fill(0, 255, 255, alpha); // Opacidad decreciente
      ellipse(leftEyeTrail[i].x, leftEyeTrail[i].y, 15);
    }

    for (let i = 0; i < rightEyeTrail.length; i++) {
      let alpha = map(i, 0, rightEyeTrail.length, 0, 255);
      noStroke();
      fill(0, 255, 255, alpha); // Opacidad decreciente
      ellipse(rightEyeTrail[i].x, rightEyeTrail[i].y, 15);
    }

    // Calcular la distancia entre las manos si ambas están visibles
    if (leftHand.confidence > 0.1 && rightHand.confidence > 0.1) {
      handDistance = dist(leftHand.x, leftHand.y, rightHand.x, rightHand.y);
    }

    // Obtener la posición del tobillo derecho
    let rightAnkle = pose.keypoints[15]; // Tobillo derecho

    if (rightAnkle.confidence > 0.1) {
      // Dibujar el círculo en el tobillo derecho
      noStroke();
      fill(0, 255, 255, 200); // Círculo con brillo
      ellipse(rightAnkle.x, rightAnkle.y, 50, 50); // Círculo en el tobillo derecho
    }
  }

  // Mapear distancia entre manos a velocidad de rotación
  let speed = map(handDistance, 0, width, 0, 10);
  angle += speed;

  // Dibujar círculo giratorio alrededor del centro
  push();
  translate(width / 2, height / 2);
  rotate(radians(angle));
  fill(0, 255, 255, 200); // Círculo con brillo
  ellipse(100, 0, 50, 50);
  pop();

  image(painting, 0, 0);
}
