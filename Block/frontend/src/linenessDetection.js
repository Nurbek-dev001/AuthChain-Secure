export const detectLiveness = async (videoElement) => {
    // Использование TensorFlow.js для обнаружения "живости"
    const model = await tf.loadGraphModel('https://tf-models.s3.amazonaws.com/liveness/model.json');
    
    // Захват кадра с веб-камеры
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoElement, 0, 0);
    
    // Преобразование изображения для модели
    const tensor = tf.browser.fromPixels(canvas)
        .resizeNearestNeighbor([224, 224])
        .toFloat()
        .expandDims();
    
    // Предсказание
    const prediction = await model.predict(tensor);
    const score = prediction.dataSync()[0];
    
    return score > 0.85; // Порог "живости"
};

export const startVideoStream = async () => {
    const video = document.createElement('video');
    video.autoplay = true;
    video.playsInline = true;
    
    const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
            facingMode: 'user',
            width: { ideal: 1920 },
            height: { ideal: 1080 }
        } 
    });
    
    video.srcObject = stream;
    await video.play();
    
    return video;
};