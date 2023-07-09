/**
 * This is used when saving the image point answer
 * @param originalSize original image size
 * @param clientSize client size 
 * @param point point the user clicked, based on the client size
 * @returns point based on original size
 */
export function getPointLocationBasedOnOriginalImageSize(originalSize: {width: number, height: number}, clientSize: {width: number, height: number}, point: {x: number, y: number}): {x: number, y: number}{
    return {
      x: Math.round((originalSize.width / clientSize.width) * point.x),
      y: Math.round((originalSize.height / clientSize.height) * point.y),
    }
  }

  export function getPointLocationBasedOnDisplayedImageSize(originalSize: {width: number, height: number}, clientSize: {width: number, height: number}, point: {x: number, y: number}): {x: number, y: number}{
    return {
      x: Math.round((clientSize.width / originalSize.width) * point.x),
      y: Math.round((clientSize.height / originalSize.height) * point.y),
    }
}
  
  /**
   * This is used to display the points according tot he current client image size
   * @param originalSize original image size uploaded to the backend
   * @param clientSize current size displayed by the client
   * @param answerText answer text: array of points in string, like so: x1,y1 x2,y2 x3,y3 ...
   */
  export function getPointsLocationBasedOnDisplayedImageSize2(originalSize: {width: number, height: number}, clientSize: {width: number, height: number}, answerText: string): string{
    // Base Displayed Image size (bw, bh): 512, 256
    // New Displayed Image size (nw, nh): 256, 128
    // Base single point coords (px, py): 10, 10
  
    // wProduct, hProduct = nw/bw, nh/bh
  
    // Now always multiple px and py by wProduct and hProduct respectivly.
    
    let newAnswText: string = "";
    let arrayOfPoints: string[] = answerText.split(" ");
  
    let wProduct: number = clientSize.width/originalSize.width;
    let hProduct: number = clientSize.height/originalSize.height;
    
    if(Number.isNaN(wProduct) || Number.isNaN(hProduct)) return "";
  
    for(let indexOfPoints = 0; indexOfPoints < arrayOfPoints.length; indexOfPoints++){
      let points: number[] = arrayOfPoints[indexOfPoints].split(",").map((x)=>{return parseInt(x)});
      //index 0 = x, index 1 = y
      points[0] = Math.round(points[0] * wProduct);
      points[1] = Math.round(points[1] * hProduct);
      // arrayOfPoints[indexOfPoints] = `${points[0]}, ${points[1]}`
  
      let posToAdd: string = "";
      if(newAnswText.length == 0){
        posToAdd = `${points[0]},${points[1]}`
      }else{
        posToAdd = ` ${points[0]},${points[1]}`
      }
      newAnswText = newAnswText + posToAdd;
    }
  
    return newAnswText;
  }

  export function getPointsLocationBasedOnDisplayedImageSize(image: HTMLImageElement, text: string): string{
    return getPointsLocationBasedOnDisplayedImageSize2(
      {width: image.naturalWidth, height: image.naturalHeight},
      {width: image.clientWidth, height: image.clientHeight},
      text
    )
  }


  