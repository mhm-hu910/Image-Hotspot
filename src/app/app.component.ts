import { Component, ViewChild, ElementRef, HostListener, ViewChildren, QueryList} from '@angular/core';
import { getPointLocationBasedOnDisplayedImageSize, getPointsLocationBasedOnDisplayedImageSize } from '../../src/assets/ts/component2';
import { getPointLocationBasedOnOriginalImageSize } from '../../src/assets/ts/component2';

export interface answer {
  shapeObject: circle | rectangle | custom | any;
  type: 'rect' | 'circle' | 'custom';
}

export interface circle{
  x: number,
  y: number,
  radius: number,
  resizing: boolean,
  isMoving: boolean
}

export interface rectangle{
  x: number,
  y: number,
  width: number,
  height: number,
  resizing: boolean,
  isMoving: boolean
}

export interface vertex{
  x: number,
  y: number
}

export interface custom{
  vertices: vertex[],
  isMoving: boolean,
  resizing: boolean,
  activeVertex: vertex | null
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent{

  title = "Image Hotspot";
  // @ViewChild('img_svg', { static: true }) img_svg!: ElementRef | null;
  // @ViewChild('img', { static: true }) image!: ElementRef | null;
  // @ViewChildren('shape') shapes!: QueryList<ElementRef>;


  answers:answer[] = []

  currentShapeBeingCreated: custom | null = null;
  creating = false;
  created = false;
  editing = false;
  edited = false;
  tempShape:custom | null = null;

  currentAnswer: answer|null = null;


  startCircleMove(event: MouseEvent, answer: answer, image:HTMLImageElement, image_svg: HTMLElement) {
    answer.shapeObject.isMoving = true;
    this.currentAnswer = answer;
  }

  moveCircleShape (event:MouseEvent, image: HTMLImageElement, svg:HTMLElement) {

    const shape = this.currentAnswer?.shapeObject;
    const img = image;
    const offsets = this.getTopLeftOffsets(image, svg);
    if (shape.isMoving) {
      let pos = getPointLocationBasedOnOriginalImageSize(
        {width: img.naturalWidth, height: img.naturalHeight},
        {width: img.clientWidth, height: img.clientHeight},
        {x: event.clientX, y: event.clientY}
      );
      shape.x = pos.x - offsets.offsetLeft;
      shape.y = pos.y - offsets.offsetTop;
    }
  }

  startRectMove(answer: answer){
    answer.shapeObject.isMoving = true;
    this.currentAnswer = answer;
  }

  moveRectShape(event:MouseEvent, image: HTMLImageElement, svg:HTMLElement) {
    const shape = this.currentAnswer?.shapeObject;
    const img = image;
    const offsets = this.getTopLeftOffsets(image, svg);
    if (shape.isMoving) {
      let pos = getPointLocationBasedOnOriginalImageSize(
        {width: img.naturalWidth, height: img.naturalHeight},
        {width: img.clientWidth, height: img.clientHeight},
        {x: event.clientX, y: event.clientY}
      );
      shape.x = Math.round(pos.x - (shape.width/2) - offsets.offsetLeft);
      shape.y = Math.round(pos.y - (shape.height/2) - offsets.offsetTop);
    }
  }

  stopMove = () => { 
    const shape = this.currentAnswer?.shapeObject;
    shape.isMoving = false;
    this.currentAnswer = null;
  }

  startMoveCS(answer: answer) {
    answer.shapeObject.isMoving = true;
    this.currentAnswer = answer;
  }


  moveCustomShape (event:MouseEvent, image: HTMLImageElement, svg:HTMLElement) {
    const shape = this.currentAnswer?.shapeObject;
    const img = image;
    if (!shape.isMoving) {
      return;
    }

    const dx = event.movementX;
    const dy = event.movementY;

    let d = {
      x: (img.naturalWidth/img.clientWidth) * dx,
      y: (img.naturalHeight/img.clientHeight) * dy
    };

    shape.vertices = shape.vertices.map((vertex: { x: number; y: number; }) => ({
      x: vertex.x + d.x,
      y: vertex.y + d.y
    }));
  }

  stopMoveCS() { 
    const shape = this.currentAnswer?.shapeObject;
    shape.isMoving = false;
    this.currentAnswer = null;
  }

  startVertexMove(event: MouseEvent, shape: { isMoving: any; vertices: any[]; activeVertex:any; }, vertexIndex: number, image:HTMLImageElement, svg:HTMLElement) {
    if(!shape.isMoving){
      shape.isMoving = true;
      shape.activeVertex = vertexIndex;
      this.moveCustomShapeVertex = (event: MouseEvent) => this.moveCustomShapeV(event, shape, image, svg);
      this.stopMoveVertex = (event: MouseEvent) => this.stopMoveV(event, shape, image, svg);
      svg.addEventListener('mousemove', this.moveCustomShapeVertex);
      svg.addEventListener('mouseup', this.stopMoveVertex);   
    }
  }
  moveCustomShapeVertex!: (event: MouseEvent) => void;
  stopMoveVertex!: (event: MouseEvent) => void;

  
  moveCustomShapeV =  (event: MouseEvent, shape: any, image: HTMLImageElement, svg:HTMLElement) => {
    const img = image;
    const offsets = this.getTopLeftOffsets(image, svg);
    if (!shape.isMoving || shape.activeVertex === null) {
      return;
    }
  
    const dx = event.clientX;
    const dy = event.clientY;

    let d = getPointLocationBasedOnOriginalImageSize(
      {width: img.naturalWidth, height: img.naturalHeight},
        {width: img.clientWidth, height: img.clientHeight},
        {x: dx, y: dy}
    );
    
    shape.vertices[shape.activeVertex] = {
      x: d.x - offsets.offsetLeft,
      y: d.y - offsets.offsetTop
    };
  }
  
  stopMoveV = (event: MouseEvent, shape: any, image: HTMLImageElement, svg:HTMLElement) => {  
    shape.isMoving = false;
    if(shape.activeVertex){
      shape.activeVertex = null;
    }
    svg.removeEventListener('mousemove', this.moveCustomShapeVertex);
    svg.removeEventListener('mouseup', this.stopMoveVertex);
  }

  startResizeCircle(answer: answer){
    answer.shapeObject.resizing = true;
    this.currentAnswer = answer;
  }

  resizeCircle (event:MouseEvent, image: HTMLImageElement, svg:HTMLElement) {
    const shape = this.currentAnswer?.shapeObject;
    const img = image;
    const offsets = this.getTopLeftOffsetsResizing(svg);
    if (shape.resizing) {

      let pos = getPointLocationBasedOnDisplayedImageSize(
        {width: img.naturalWidth, height: img.naturalHeight},
      {width: img.clientWidth, height: img.clientHeight},
      {x: shape.x, y: shape.y});

      const dx = event.x - pos.x - offsets.offsetLeft;

      let newRadius = Math.round((img.naturalWidth / img.clientWidth) * Math.sqrt(dx * dx));

      shape.radius = newRadius;
    }
  }

  stopResizeCircle() {
    const shape = this.currentAnswer?.shapeObject;
    shape.resizing = false;
    this.currentAnswer = null;
  }

  startResizeRect(event: MouseEvent, shape: rectangle, image:HTMLImageElement, svg:HTMLElement, corner: string) {
    shape.resizing = true;
    this.resizeRectWithCorner = (event: MouseEvent) => this.resizeRect(event, shape, image, svg, corner);
    this.stopResizeRectWithCorner = (event: MouseEvent) => this.stopResizeRect(event, shape, svg);
    svg.addEventListener('mousemove', this.resizeRectWithCorner);
    svg.addEventListener('mouseup', this.stopResizeRectWithCorner);
  }

  resizeRectWithCorner!: (event: MouseEvent) => void;
  stopResizeRectWithCorner!: (event: MouseEvent) => void;

  resizeRect = (event: MouseEvent, shape:rectangle, image:HTMLImageElement, svg:HTMLElement, corner:string) => {
    const img = image;
    const offsets = this.getTopLeftOffsetsResizing(svg);
    const d = this.getRectSize(shape, image);
    let pos = getPointLocationBasedOnDisplayedImageSize(
    {width: img.naturalWidth, height: img.naturalHeight},
    {width: img.clientWidth, height: img.clientHeight},
    {x: shape.x, y: shape.y});
    
    if (shape.resizing) {
      let w = Math.round((img.naturalWidth / img.clientWidth) * (event.x - pos.x - offsets.offsetLeft));
      let h = Math.round((img.naturalWidth / img.clientWidth) * (event.y - pos.y - offsets.offsetTop));
        if (corner === "bottom-right" && (event.clientX > (pos.x + 12 + offsets.offsetLeft)) && (event.clientY > (pos.y + 12 + offsets.offsetTop))) {
            shape.width = w;
            shape.height = h;
        } else if (corner === "top-right" && (event.clientX > (pos.x + 12 + offsets.offsetLeft)) && (event.clientY < (pos.y + d.height - 12 + offsets.offsetTop))) {
            shape.y += h;
            shape.width = w;
            shape.height -= h;
        } else if (corner === "top-left" && (event.clientX < (pos.x + d.width - 12 + offsets.offsetLeft)) && (event.clientY < (pos.y + d.height - 12 + offsets.offsetTop))) {
            shape.x += w;
            shape.y += h;
            shape.width -= w;
            shape.height -= h;
        } else if (corner === "bottom-left" && (event.clientX < (pos.x + d.width - 12 + offsets.offsetLeft)) && (event.clientY > (pos.y + 12 + offsets.offsetTop))) {
            shape.x += w;
            shape.width -= w;
            shape.height = h;
        }
    }
  }
  
  stopResizeRect = (event: MouseEvent, shape: rectangle, svg:HTMLElement) => {
    shape.resizing = false;
    svg.removeEventListener('mousemove', this.resizeRectWithCorner);
    svg.removeEventListener('mouseup', this.stopResizeRectWithCorner);
  }

  addCircle(image: HTMLImageElement){
    let pos = getPointLocationBasedOnOriginalImageSize(
      {width: image.naturalWidth, height: image.naturalHeight},
      {width: image.clientWidth, height: image.clientHeight},
      {x: (image.clientWidth/2), y: (image.clientHeight/2)}
    );

    let newCircle = {
      x: pos.x,
      y: pos.y,
      radius: 40,
      resizing: false,
      isMoving: false
    };
    this.answers.push({
      shapeObject: newCircle,
      type: 'circle'
    });
  }

  addRect(image: HTMLImageElement){
    let pos = getPointLocationBasedOnOriginalImageSize(
      {width: image.naturalWidth, height: image.naturalHeight},
      {width: image.clientWidth, height: image.clientHeight},
      {x: image.clientWidth/2, y: image.clientHeight/2}
    );
    let newRect = {
      x: pos.x,
      y: pos.y,
      width: 75,
      height: 75,
      resizing: false,
      isMoving: false
    };
    this.answers.push({
      shapeObject: newRect,
      type: 'rect'
    });
  }

  removeShape(index:number){
    this.answers.splice(index, 1);
  }

  startCreateShape() {
    this.creating = true;
    this.currentShapeBeingCreated = { vertices: [], isMoving: false, resizing: false, activeVertex: null };
  }

  addVertex(event: MouseEvent, image: HTMLImageElement, svg: HTMLElement) {
    const img = image;
    const offsets = this.getTopLeftOffsets(image, svg);
    if (this.currentShapeBeingCreated && !this.edited) {
      this.created = true;
      let pos = getPointLocationBasedOnOriginalImageSize(
        {width: img.naturalWidth, height: img.naturalHeight},
        {width: img.clientWidth, height: img.clientHeight},
        {x: event.clientX, y: event.clientY}
      );
      this.currentShapeBeingCreated.vertices.push({ x: pos.x - offsets.offsetLeft, y: pos.y - offsets.offsetTop });
    }
    if(this.editing){
      this.edited = false;
    }
  }

  finishShape() {
    if (this.currentShapeBeingCreated) {
      this.creating = false;
      this.created = false;
      this.answers.push({
        shapeObject: this.currentShapeBeingCreated,
        type: 'custom'
      });
      this.currentShapeBeingCreated = null;
      this.editing = false;
      this.edited = false;
    
    }
  }

  convertArrayToString(vertices: {x: number, y: number}[]): string {
    return vertices.map(vertex => `${vertex.x},${vertex.y}`).join(' ');
  }

  convertStringToArray(pointsString: string): {x: number, y: number}[] {
    const pointsArray = pointsString.split(' ');
    return pointsArray.map(point => {
      const [x,y] = point.split(',').map(Number);
      return {x, y};
    });
  }

  getPathData(customShape: any, image:HTMLImageElement): string {
    let cordinates = this.convertArrayToString(customShape.vertices);
    let points = getPointsLocationBasedOnDisplayedImageSize(image, cordinates);
  
    let pointsArray = points.split(' ').map(point => point.split(',').map(Number));
  
    let pathData = `M ${pointsArray[0][0]} ${pointsArray[0][1]}`;
    
    for (let i = 1; i < pointsArray.length; i++) {
      pathData += `L ${pointsArray[i][0]} ${pointsArray[i][1]}`;
    }
    pathData += 'Z';
    return pathData;
  }
  

  getLeftMostX(shape:any, image:HTMLImageElement):number{
    let minX = 9999999;
    let pointsArray = this.getPointsArrayBasedOnDisplayedImageSize(shape, image);
    for(let vertex of pointsArray){
      if(vertex.x < minX){
        minX = vertex.x;
      }
    }
    return minX;
  }

  getTopMostY(shape:any, image:HTMLImageElement):number{
    let minY = 9999999;
    let pointsArray = this.getPointsArrayBasedOnDisplayedImageSize(shape, image);
    for(let vertex of pointsArray){
      if(vertex.y < minY){
        minY = vertex.y;
      }
    }
    return minY;
  }

  cancelShape(){
    this.currentShapeBeingCreated = null;
    this.creating = false;
    this.created = false;
    if(this.editing){
      this.editing = false;
      this.edited = false;
      this.answers.push({
        shapeObject: this.tempShape as custom,
        type: 'custom'
      });
      this.tempShape = null;
    }
  }

  editCustomeShape(index:number, shape:any){
    this.tempShape = JSON.parse(JSON.stringify(shape));
    this.currentShapeBeingCreated = shape;
    this.answers.splice(index, 1);
    this.creating = true;
    this.created = true;
    this.editing = true;
    this.edited = true;
  }

  getVertex(shape: any, index: number, image:HTMLImageElement){
    let pointsArray = this.getPointsArrayBasedOnDisplayedImageSize(shape, image);
    return pointsArray[index];
  }

  getPointsArrayBasedOnDisplayedImageSize(shape: any, image:HTMLImageElement){
    let cordinates = this.convertArrayToString(shape.vertices);
    let points = getPointsLocationBasedOnDisplayedImageSize(image, cordinates);
    return this.convertStringToArray(points);
  }

  onResizeCShape(shape:any, shapeHtml:HTMLElement, image:HTMLImageElement) {
    let newPath = this.getPathData(shape, image);
    shapeHtml.setAttribute("d", newPath);
  }

  onResizeCircle(shape: circle, shapeHtml: HTMLElement, image:HTMLImageElement) {
    const img = image;
    let pos = getPointLocationBasedOnDisplayedImageSize(
        {width: img.naturalWidth, height: img.naturalHeight},
        {width: img.clientWidth, height: img.clientHeight},
        {x: shape.x, y: shape.y}
      );
    let newRadius = this.getCircleRadiusBasedOnDisplayedImageSize(shape, img);
    shapeHtml.setAttribute('cx', pos.x.toString());
    shapeHtml.setAttribute('cy', pos.y.toString());
    shapeHtml.setAttribute('r', newRadius.toString());
  }

  onResizeRect(shape: rectangle, shapeHtml: HTMLElement, image:HTMLImageElement){
    const img = image;
    let pos = getPointLocationBasedOnDisplayedImageSize(
        {width: img.naturalWidth, height: img.naturalHeight},
        {width: img.clientWidth, height: img.clientHeight},
        {x: shape.x, y: shape.y}
      );
      let w = Math.round((img.clientWidth / img.naturalWidth) * shape.width);
      let h = Math.round((img.clientHeight / img.naturalHeight) * shape.height);
      shapeHtml.setAttribute('x', pos.x.toString());
      shapeHtml.setAttribute('y', pos.y.toString());
      shapeHtml.setAttribute('width', w.toString());
      shapeHtml.setAttribute('height', h.toString());
  }

  getCirclePosition(circleShape:circle, image:HTMLImageElement){
    return getPointLocationBasedOnDisplayedImageSize({width: image.naturalWidth, height: image.naturalHeight},
      {width: image.clientWidth, height: image.clientHeight},
      {x: circleShape.x, y: circleShape.y}
      );
  }

  getRectPosition(rectShape: rectangle, image:HTMLImageElement){
    return getPointLocationBasedOnDisplayedImageSize({width: image.naturalWidth, height: image.naturalHeight},
      {width: image.clientWidth, height: image.clientHeight},
      {x: rectShape.x, y: rectShape.y}
      );
  }

  getRectSize(rectShape: rectangle, image:HTMLImageElement){
    const img = image;
    let w = Math.round((img.clientWidth / img.naturalWidth) * rectShape.width);
    let h = Math.round((img.clientWidth / img.naturalWidth) * rectShape.height);
    return({width: w, height: h});
  }

  getCircleRadiusBasedOnDisplayedImageSize(circleShape:circle, image:HTMLImageElement){
    let img = image;
    return (Math.round((img.clientWidth / img.naturalWidth) * circleShape.radius));
  }

  getTopLeftOffsets(image: HTMLImageElement, svg:HTMLElement) {
    const img = image;
    const element = svg.getBoundingClientRect();
    let left = Math.trunc((img.naturalWidth / img.clientWidth) * element.left);
    let top = Math.trunc((img.naturalHeight / img.clientHeight) * element.top);
    return {
      offsetTop: top,
      offsetLeft: left
    };
  }

  getTopLeftOffsetsResizing(svg:HTMLElement) {
    const element = svg.getBoundingClientRect();
    return {
      offsetTop: Math.trunc(element.top),
      offsetLeft: Math.trunc(element.left)
    };
  }

  onMouseMove(event:MouseEvent, image: HTMLImageElement, svg:HTMLElement){
    const answer = this.currentAnswer;
    if (answer !== null){
      let shape = answer.shapeObject;
      if(answer.type === "circle"){
        if(shape.isMoving){
          this.moveCircleShape(event, image, svg);
        }
        else if(shape.resizing){
          this.resizeCircle(event, image, svg);
        }
      }
      else if(answer.type === "rect"){
        if(shape.isMoving){
          this.moveRectShape(event, image, svg);
        }
      }
      else if(answer.type === "custom"){
        if(shape.isMoving){
          this.moveCustomShape(event, image, svg);
        }
      }
    }
  }

  onMouseUp(){
    const answer = this.currentAnswer;
    if (answer !== null){
      let shape = answer.shapeObject;
      if(answer.type === "circle"){
        if(shape.isMoving){
          this.stopMove();
        }
        else if(shape.resizing){
          this.stopResizeCircle();
        }
      }
      else if(answer.type === "rect"){
        if(shape.isMoving){
          this.stopMove();
        }
      }
      else if(answer.type === "custom"){
        if(shape.isMoving){
          this.stopMoveCS();
        }
      }
    }
  }
}



