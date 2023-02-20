main();

//
// start here
//
function main() {
  const canvas = document.querySelector("#glcanvas");
  // Initialize the GL context
  const gl = canvas.getContext("webgl2");

  // Only continue if WebGL is available and working
  if (gl === null) {
    alert(
      "Unable to initialize WebGL. Your browser or machine may not support it."
    );
    return;
  }

  // Set clear color to black, fully opaque
  gl.clearColor(0.0, 1.0, 0.0, 1.0);
  // Clear the color buffer with specified clear color
  gl.clear(gl.COLOR_BUFFER_BIT);


  const vertexCode = `
  #version 300 es

  in vec4 vertexPosition;

  void main() {
    gl_Position = vertexPosition;
  }
  `;

  const fragmentCode = `
  #version 300 es
  precision highp float;

  uniform int frame;
  uniform float sinframe;
  uniform vec2 canvasSize;
  out vec4 fragColor;

  void main() {
    vec2 coord = gl_FragCoord.xy/canvasSize.xy;
    fragColor = vec4(coord.x, coord.y, (sinframe / 2.) + 0.5, 1);
  }
  `
  ;

  let mycode = " color ( X ) ( Y ) ((sine (Frame / 50)) + 0.5)  (1) ";

  function createShader(shaderType, sourceCode) {
    const shader = gl.createShader(shaderType);
    gl.shaderSource(shader, sourceCode.trim());
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw gl.getShaderInfoLog(shader);
    }
    return shader;
  }
  
  const program = gl.createProgram();
  gl.attachShader(program, createShader(gl.VERTEX_SHADER, vertexCode));
  gl.attachShader(program, createShader(gl.FRAGMENT_SHADER, fragmentCode));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw gl.getProgramInfoLog(program);
  }
  gl.useProgram(program);

  const vertices = [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ];
  const vertexData = new Float32Array(vertices.flat());
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);

  const vertexPosition = gl.getAttribLocation(program, "vertexPosition");
  gl.enableVertexAttribArray(vertexPosition);
  gl.vertexAttribPointer(vertexPosition, 2, gl.FLOAT, false, 0, 0);

  const canvasSizeUniform = gl.getUniformLocation(program, 'canvasSize');
  gl.uniform2f(canvasSizeUniform, canvas.width, canvas.height);

  let frame = 0;

  const everyFrame = function() {
    frame += 1;

    const frameUniform = gl.getUniformLocation(program, 'frame');
    gl.uniform1i(frameUniform, frame);
  
    const sinFrameUniform = gl.getUniformLocation(program, 'sinframe');
    gl.uniform1f(sinFrameUniform, Math.sin(frame/50));

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertices.length);

  }

  var t = setInterval(everyFrame, 30);

}