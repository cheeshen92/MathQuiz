var model;

async function loadModel() {
    model = await tf.loadGraphModel('TFJS/model.json');
}

function predictImage() {
    console.log('processing ...');

    // CHange to BW & increase contrast
    let image = cv.imread(canvas);
    cv.cvtColor(image, image, cv.COLOR_RGBA2GRAY, 0);
    cv.threshold(image, image, 175, 255, cv.THRESH_BINARY);

    // Find Contour
    let contours = new cv.MatVector();
    let hierachy = new cv.Mat();
    cv.findContours(image, contours, hierachy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);

    // Crop
    let cnt = contours.get(0);
    let rect = cv.boundingRect(cnt);
    image = image.roi(rect);

    // Resize
    var height = image.rows;
    var width = image.cols;

    if (height > width) {
        height = 20;
        const scaleFactor = image.rows/height;
        width = Math.round(image.cols/scaleFactor);
    } else {
        width = 20;
        const scaleFactor = image.cols/width;
        height = Math.round(image.rows/scaleFactor);
    }

    let newSize = new cv.Size(width, height);
    cv.resize(image, image, newSize, 0, 0, cv.INTER_AREA);

    // Padding
    const left = 4 + Math.ceil((20-width)/2) ;
    const right= 4 + Math.floor((20-width)/2) ;
    const top = 4 + Math.ceil((20-height)/2) ;
    const bottom = 4 + Math.floor((20-height)/2) ;

    const BLACK = new cv.Scalar(0,0,0,0);
    cv.copyMakeBorder(image, image, top, bottom, left, right, cv.BORDER_CONSTANT, );

    //Centre of Mass
    cv.findContours(image, contours, hierachy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
    cnt = contours.get(0);
    const Moments = cv.moments(cnt, false);

    const cx = Moments.m10 / Moments.m00;
    const cy = Moments.m01 / Moments.m00;

    const X_SHIFT = Math.round(image.cols/2.0 - cx);
    const Y_SHIFT = Math.round(image.rows/2.0 - cy);

    newSize = new cv.Size(image.cols, image.rows);
    const M = cv.matFromArray(2, 3, cv.CV_64FC1, [1, 0, X_SHIFT, 0, 1, Y_SHIFT]);
    cv.warpAffine(image, image, M, newSize, cv.INTER_LINEAR, cv.BORDER_CONSTANT, BLACK);

    let pixelValues = image.data;

    pixelValues = Float32Array.from(pixelValues);

    pixelValues = pixelValues.map(function(item){
        return item/255.0;
    });

    const X = tf.tensor([pixelValues]);
    const result = model.predict(X);

    result.print();

    const output = result.dataSync()[0];

    //const outputCanvas = document.createElement('CANVAS');
    //cv.imshow(outputCanvas, image);
    //document.body.appendChild(outputCanvas);

    // delete unused
    image.delete();
    contours.delete();
    cnt.delete();
    hierachy.delete();
    M.delete();
    X.dispose();
    result.dispose();

    return output;
}