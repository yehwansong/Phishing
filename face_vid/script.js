import DeviceDetector from "https://cdn.skypack.dev/device-detector-js@2.2.10";
// Usage: testSupport({client?: string, os?: string}[])
// Client and os are regular expressions.
// See: https://cdn.jsdelivr.net/npm/device-detector-js@2.2.10/README.md for
// legal values for client and os
testSupport([
    { client: 'Chrome' },
]);
function testSupport(supportedDevices) {
    const deviceDetector = new DeviceDetector();
    const detectedDevice = deviceDetector.parse(navigator.userAgent);
    let isSupported = false;
    for (const device of supportedDevices) {
        if (device.client !== undefined) {
            const re = new RegExp(`^${device.client}$`);
            if (!re.test(detectedDevice.client.name)) {
                continue;
            }
        }
        if (device.os !== undefined) {
            const re = new RegExp(`^${device.os}$`);
            if (!re.test(detectedDevice.os.name)) {
                continue;
            }
        }
        isSupported = true;
        break;
    }
    if (!isSupported) {
        alert(`This demo, running on ${detectedDevice.client.name}/${detectedDevice.os.name}, ` +
            `is not well supported at this time, continue at your own risk.`);
    }
}
/**
 * @fileoverview Demonstrates a minimal use case for MediaPipe face tracking.
 */
 $(document).ready(function(){
    alert('2')
 })
 var init_pos = [0,0]
const controls = window;
const drawingUtils = window;
const mpFaceDetection = window;
// Our input frames will come from here.
const videoElement = document.getElementsByClassName('input_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const controlsElement = document.getElementsByClassName('control-panel')[0];
const canvasCtx = canvasElement.getContext('2d');
var counter = 0
var anti_counter = 0
var videoOn = false
var playing = false
// We'll add this to our control panel later, but we'll save it here so we can
// call tick() each time the graph runs.
const fpsControl = new controls.FPS();
// Optimization: Turn off animated spinner after its hiding animation is done.
const spinner = document.querySelector('.loading');
spinner.ontransitionend = () => {
    spinner.style.display = 'none';
};
function onResults(results) {
    // Hide the spinner.
    if(results.detections.length==1 && init_pos[0]==0){
        init_pos[0]=results.detections[0].boundingBox.xCenter
        init_pos[1]=results.detections[0].boundingBox.yCenter
}
    document.body.classList.add('loaded');
    // Update the frame rate.
    fpsControl.tick();
    // Draw the overlays.
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
    if (results.detections.length > 0) {
        drawingUtils.drawRectangle(canvasCtx, results.detections[0].boundingBox, { color: 'blue', lineWidth: 4, fillColor: '#00000000' });
        drawingUtils.drawLandmarks(canvasCtx, results.detections[0].landmarks, {
            color: 'red',
            radius: 5,
        });
    }
    if(results.detections.length>0){
        counter++
        videoOn = false
        for (var i = results.detections.length - 1; i >= 0; i--) {
            if((Math.abs(init_pos[0]-results.detections[i].boundingBox.xCenter)<0.1) && (Math.abs(init_pos[1]-results.detections[i].boundingBox.yCenter)<0.1)){
                videoOn = true
            }
        }
        anti_counter = 0
    }else{
        counter = 0
        anti_counter++
        if(anti_counter>10){
        videoOn = false}
    }
    if(videoOn){
        console.log('1')
        if(!playing){
            playing = true
            const video = document.getElementById('myVideo');
            video.currentTime = 0; // Start from the beginning
            video.play(); // Play the 
        }
        $('video').css({'opacity':1})
    }else{
        playing = false
        
        console.log('2')
        $('video').css({'opacity':0})
            const video = document.getElementById('myVideo');
            video.pause(); // Pause the video
            video.currentTime = 0; // Reset to the beginning
        }
        $('.counter').html('counter:'+counter)
        $('.anti_counter').html('anti_counter:'+anti_counter)

    canvasCtx.restore();
}
function formatToThreeDigits(number) {
    return number.toString().padStart(3, '0');
}
const faceDetection = new mpFaceDetection.FaceDetection({ locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection@0.4/${file}`;
    } });
faceDetection.onResults(onResults);
// Present a control panel through which the user can manipulate the solution
// options.
new controls
    .ControlPanel(controlsElement, {
    selfieMode: true,
    model: 'short',
    minDetectionConfidence: 0.5,
})
    .add([
    new controls.StaticText({ title: 'MediaPipe Face Detection' }),
    fpsControl,
    new controls.Toggle({ title: 'Selfie Mode', field: 'selfieMode' }),
    new controls.SourcePicker({
        onSourceChanged: () => {
            faceDetection.reset();
        },
        onFrame: async (input, size) => {
            const aspect = size.height / size.width;
            let width, height;
            if (window.innerWidth > window.innerHeight) {
                height = window.innerHeight;
                width = height / aspect;
            }
            else {
                width = window.innerWidth;
                height = width * aspect;
            }
            canvasElement.width = width;
            canvasElement.height = height;
            await faceDetection.send({ image: input });
        },
        examples: {
            images: [],
            videos: [],
        },
    }),
    new controls.Slider({
        title: 'Model Selection',
        field: 'model',
        discrete: { 'short': 'Short-Range', 'full': 'Full-Range' },
    }),
    new controls.Slider({
        title: 'Min Detection Confidence',
        field: 'minDetectionConfidence',
        range: [0, 1],
        step: 0.01
    }),
])
    .on(x => {
    const options = x;
    videoElement.classList.toggle('selfie', options.selfieMode);
    faceDetection.setOptions(options);
});