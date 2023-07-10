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
  @ViewChild('img_svg', { static: true }) img_svg!: ElementRef | null;
  @ViewChild('img', { static: true }) image!: ElementRef | null;
  //@ViewChildren('shape') shapes!: QueryList<ElementRef>;


  answers:answer[] = []

  currentShapeBeingCreated: custom | null = null;
  creating = false;
  created = false;
  editing = false;
  edited = false;
  tempShape:custom | null = null;

  currentCustomShape:any = {};
  currentShape:any = {};
  currentAnswer: answer|null = null;


  startCircleMove(event: MouseEvent, answer: answer, image:HTMLImageElement, image_svg: HTMLElement) {
    answer.shapeObject.isMoving = true;
    this.currentAnswer = answer;
    // console.log(shape);
    // image_svg.addEventListener('mousemove', (event:MouseEvent) => {this.moveCircleShape(event, image)});
    // image_svg.addEventListener('mouseup', (event:MouseEvent) => {this.stopMove(event, image, image_svg)});
  }

  moveCircleShape (event:MouseEvent, image: HTMLImageElement, svg:HTMLElement) {

    const shape = this.currentAnswer?.shapeObject;
    const img = image;
    const offsets = this.getTopLeftOffsets();
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

  startRectMove(event: MouseEvent, shape: { isMoving: boolean; }){
    shape.isMoving = true;
    this.currentShape = shape;
    this.img_svg?.nativeElement.addEventListener('mousemove', this.moveRectShape);
    this.img_svg?.nativeElement.addEventListener('mouseup', this.stopMove);
  }

  moveRectShape = (event: MouseEvent) => {
    const shape = this.currentShape;
    const img = this.image?.nativeElement;
    const offsets = this.getTopLeftOffsets();
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
    const shape = this.currentShape;
    shape.isMoving = false;
    // image_svg.removeEventListener('mousemove', ()=>{this.moveCircleShape(event, image)});
    // this.img_svg?.nativeElement.removeEventListener('mousemove', this.moveRectShape);
    // image_svg.removeEventListener('mouseup', ()=>{this.stopMove(event, image, image_svg)});
    this.currentAnswer = null;
  }

  startMoveCS(event: MouseEvent, shape: { isMoving: boolean; }) {
    shape.isMoving = true;
    this.currentCustomShape = shape;
    this.img_svg?.nativeElement.addEventListener('mousemove', this.moveCustomShape);
    this.img_svg?.nativeElement.addEventListener('mouseup', this.stopMoveCS);
  }


  moveCustomShape =  (event: MouseEvent) => {
    const shape = this.currentCustomShape;
    const img = this.image?.nativeElement;
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

  stopMoveCS  =  (event: MouseEvent) => { 
    const shape = this.currentCustomShape;
    shape.isMoving = false;
    if(shape.activeVertex){
      shape.activeVertex = null;
    }
    this.img_svg?.nativeElement.removeEventListener('mousemove', this.moveCustomShape);
    this.img_svg?.nativeElement.removeEventListener('mouseup', this.stopMoveCS);
  }

  startVertexMove(event: MouseEvent, shape: { isMoving: any; vertices: any[]; activeVertex:any; }, vertexIndex: number) {
    if(!shape.isMoving){
      shape.isMoving = true;
      shape.activeVertex = vertexIndex;
      this.currentCustomShape = shape;
      this.img_svg?.nativeElement.addEventListener('mousemove', this.moveCustomShapeV);
      this.img_svg?.nativeElement.addEventListener('mouseup', this.stopMoveV);   
    }
  }
  
  moveCustomShapeV =  (event: MouseEvent) => {
    const shape = this.currentCustomShape;
    const img = this.image?.nativeElement;
    const offsets = this.getTopLeftOffsets();
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
  
  stopMoveV = (event: MouseEvent) => {  
    const shape = this.currentCustomShape;
    shape.isMoving = false;
    if(shape.activeVertex){
      shape.activeVertex = null;
    }
    this.img_svg?.nativeElement.removeEventListener('mousemove', this.moveCustomShapeV);
    this.img_svg?.nativeElement.removeEventListener('mouseup', this.stopMoveV);
  }

  startResizeCircle(event: MouseEvent, shape: { resizing: boolean; }){
    event.preventDefault();
    shape.resizing = true;
    this.currentShape = shape;
    this.img_svg?.nativeElement.addEventListener('mousemove', this.resizeCircle);
    this.img_svg?.nativeElement.addEventListener('mouseup', this.stopResizeCircle);
  }

  resizeCircle = (event: MouseEvent) => {
    const shape = this.currentShape;
    const img = this.image?.nativeElement;
    const offsets = this.getTopLeftOffsetsResizing();
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

  stopResizeCircle = (event: MouseEvent) => {
    const shape = this.currentShape;
    shape.resizing = false;
    this.img_svg?.nativeElement.removeEventListener('mousemove', this.resizeCircle);
    this.img_svg?.nativeElement.removeEventListener('mouseup', this.stopResizeCircle);
  }

  startResizeRect(event: MouseEvent, shape: rectangle, corner: string) {
    event.preventDefault();
    shape.resizing = true;
    this.currentShape = shape;
    this.resizeRectWithCorner = (event: MouseEvent) => this.resizeRect(event, corner);
    this.img_svg?.nativeElement.addEventListener('mousemove', this.resizeRectWithCorner);
    this.img_svg?.nativeElement.addEventListener('mouseup', this.stopResizeRect);
  }


  resizeRectWithCorner!: (event: MouseEvent) => void;

  resizeRect = (event: MouseEvent, corner:string) => {
    const shape = this.currentShape;
    const img = this.image?.nativeElement;
    const offsets = this.getTopLeftOffsetsResizing();
    const d = this.getRectSize(shape);
    let pos = getPointLocationBasedOnDisplayedImageSize(
    {width: img.naturalWidth, height: img.naturalHeight},
    {width: img.clientWidth, height: img.clientHeight},
    {x: shape.x, y: shape.y});
    
    if (shape.resizing) {
      let sizeCondition:boolean = (shape.width >= 20) && (shape.height >= 20);
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
  
  stopResizeRect= (event: MouseEvent) => {
    const shape = this.currentShape;
    shape.resizing = false;
    this.img_svg?.nativeElement.removeEventListener('mousemove', this.resizeRectWithCorner);
    this.img_svg?.nativeElement.removeEventListener('mouseup', this.stopResizeRect);
  }

  addCircle(){
    let pos = getPointLocationBasedOnOriginalImageSize(
      {width: this.image?.nativeElement.naturalWidth, height: this.image?.nativeElement.naturalHeight},
      {width: this.image?.nativeElement.clientWidth, height: this.image?.nativeElement.clientHeight},
      {x: (this.image?.nativeElement.clientWidth/2), y: (this.image?.nativeElement.clientHeight/2)}
    );

    let newCircle = {
      x: pos.x,
      y: pos.y,
      radius: 40,
      resizing: false,
      isMoving: false
    };
    //this.circles.push(newCircle);
    this.answers.push({
      shapeObject: newCircle,
      type: 'circle'
    });
  }

  addRect(){
    let pos = getPointLocationBasedOnOriginalImageSize(
      {width: this.image?.nativeElement.naturalWidth, height: this.image?.nativeElement.naturalHeight},
      {width: this.image?.nativeElement.clientWidth, height: this.image?.nativeElement.clientHeight},
      {x: this.image?.nativeElement.clientWidth/2, y: this.image?.nativeElement.clientHeight/2}
    );
    let newRect = {
      x: pos.x,
      y: pos.y,
      width: 75,
      height: 75,
      resizing: false,
      isMoving: false
    };
    //this.rectangles.push(newRect);
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

  addVertex(event: MouseEvent) {
    const img = this.image?.nativeElement;
    const offsets = this.getTopLeftOffsets();
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
      //this.customShapes.push(this.currentShapeBeingCreated);
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

  getPathData(customShape: any): string {
    let cordinates = this.convertArrayToString(customShape.vertices);
    let points = getPointsLocationBasedOnDisplayedImageSize(this.image?.nativeElement, cordinates);
  
    let pointsArray = points.split(' ').map(point => point.split(',').map(Number));
  
    let pathData = `M ${pointsArray[0][0]} ${pointsArray[0][1]}`;
    
    for (let i = 1; i < pointsArray.length; i++) {
      pathData += `L ${pointsArray[i][0]} ${pointsArray[i][1]}`;
    }
    pathData += 'Z';
    return pathData;
  }
  

  getLeftMostX(shape:any):number{
    let minX = 9999999;
    let pointsArray = this.getPointsArrayBasedOnDisplayedImageSize(shape);
    for(let vertex of pointsArray){
      if(vertex.x < minX){
        minX = vertex.x;
      }
    }
    return minX;
  }

  getTopMostY(shape:any):number{
    let minY = 9999999;
    let pointsArray = this.getPointsArrayBasedOnDisplayedImageSize(shape);
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

  getVertex(shape: any, index: number){
    let pointsArray = this.getPointsArrayBasedOnDisplayedImageSize(shape);
    return pointsArray[index];
  }

  getPointsArrayBasedOnDisplayedImageSize(shape: any){
    let cordinates = this.convertArrayToString(shape.vertices);
    let points = getPointsLocationBasedOnDisplayedImageSize(this.image?.nativeElement, cordinates);
    return this.convertStringToArray(points);
  }

  onResizeCShape(shape:any, shapeHtml:HTMLElement) {
    let newPath = this.getPathData(shape);
    shapeHtml.setAttribute("d", newPath);
  }

  onResizeCircle(shape: circle, shapeHtml: HTMLElement) {
    const img = this.image?.nativeElement;
    let pos = getPointLocationBasedOnDisplayedImageSize(
        {width: img.naturalWidth, height: img.naturalHeight},
        {width: img.clientWidth, height: img.clientHeight},
        {x: shape.x, y: shape.y}
      );
    let newRadius = this.getCircleRadiusBasedOnDisplayedImageSize(shape);
    shapeHtml.setAttribute('cx', pos.x.toString());
    shapeHtml.setAttribute('cy', pos.y.toString());
    shapeHtml.setAttribute('r', newRadius.toString());
  }

  onResizeRect(shape: any, shapeHtml: HTMLElement){
    const img = this.image?.nativeElement;
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

  getCirclePosition(circleShape:any){
    return getPointLocationBasedOnDisplayedImageSize({width: this.image?.nativeElement.naturalWidth, height: this.image?.nativeElement.naturalHeight},
      {width: this.image?.nativeElement.clientWidth, height: this.image?.nativeElement.clientHeight},
      {x: circleShape.x, y: circleShape.y}
      );
  }

  getRectPosition(rectShape: any){
    return getPointLocationBasedOnDisplayedImageSize({width: this.image?.nativeElement.naturalWidth, height: this.image?.nativeElement.naturalHeight},
      {width: this.image?.nativeElement.clientWidth, height: this.image?.nativeElement.clientHeight},
      {x: rectShape.x, y: rectShape.y}
      );
  }

  getRectSize(rectShape: any){
    const img = this.image?.nativeElement;
    let w = Math.round((img.clientWidth / img.naturalWidth) * rectShape.width);
    let h = Math.round((img.clientWidth / img.naturalWidth) * rectShape.height);
    return({width: w, height: h});
  }

  getCircleRadiusBasedOnOriginalImageSize(circleShape:any){
    let img = this.image?.nativeElement;
    return (Math.round((img.naturalWidth / img.clientWidth) * circleShape.radius));
  }

  getCircleRadiusBasedOnDisplayedImageSize(circleShape:any){
    let img = this.image?.nativeElement;
    return (Math.round((img.clientWidth / img.naturalWidth) * circleShape.radius));
  }


  getTopLeftOffsets() {
    const img = this.image?.nativeElement;
    const svg = this.img_svg?.nativeElement;
    const element = svg.getBoundingClientRect();
    let left = Math.trunc((img.naturalWidth / img.clientWidth) * element.left);
    let top = Math.trunc((img.naturalHeight / img.clientHeight) * element.top);
    return {
      offsetTop: top,
      offsetLeft: left
    };
  }

  getTopLeftOffsetsResizing() {
    const img = this.image?.nativeElement;
    const svg = this.img_svg?.nativeElement;
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

        }
      }
      else if(answer.type === "rect"){
        
      }
      else if(answer.type === "custom"){

      }
    }
  }

  onMouseUp(image: HTMLImageElement, svg:HTMLElement){
    const answer = this.currentAnswer;
    if (answer !== null){
      let shape = answer.shapeObject;
      if(answer.type === "circle"){
        if(shape.isMoving){
          this.stopMove();
        }
        else if(shape.resizing){

        }
      }
      else if(answer.type === "rect"){
        
      }
      else if(answer.type === "custom"){

      }
    }
  }
}



