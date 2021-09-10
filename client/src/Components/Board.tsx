import React, { useEffect, useRef, useState } from 'react'
import { TeamObj } from '../Types';

type Props = {
    idRoom: string | number
    socketRef: React.MutableRefObject<any>
    imPlaying: boolean | undefined
}

type mouseNumber = {
    x: number
    y: number
}

type DrawData = {
    idRoom: string | number
    last_mouse: mouseNumber
    mouse: mouseNumber
    widthOfLine: number
    colorOfLine: string
    base64ImageData: string
}



const Board: React.FC<Props>  = ({ idRoom, socketRef, imPlaying }) => {  
    
    useEffect(() => {
        socketRef.current.on("board erased", (bool: boolean) => {
            let canvas = document.getElementById('board') as HTMLCanvasElement;  
            
            if (canvas !== null) {
                let ctx = canvas.getContext('2d') as CanvasRenderingContext2D;       
            
                let inputColor = document.querySelector('.color-brush') as HTMLInputElement

                if (inputColor !== null) {
                    inputColor.value = '#000'
                }
                
                ctx.clearRect(0, 0, 0, 0)
                            
                ctx.lineWidth = 4;

                canvas.height = 400
            }
    
            
        })
        
        if (imPlaying === true) {
            drawOnCanvas();
        } else {
            socketRef.current.on("canvas data drawn img", (dataDrawing: DrawData) => {                                                        
                let canvas = document.getElementById('board') as HTMLCanvasElement; 
                
                if (canvas !== null) {
                    let ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

                    ctx.lineWidth = dataDrawing.widthOfLine;
                    ctx.strokeStyle = dataDrawing.colorOfLine;

                    let image = new Image()
                    image.onload = function() {
                        ctx.drawImage(image, 0, 0)
                    }
                    image.src = dataDrawing.base64ImageData
                }


                // ctx.beginPath();
                // ctx.moveTo(dataDrawing.last_mouse.x, dataDrawing.last_mouse.y);
                // ctx.lineTo(dataDrawing.mouse.x, dataDrawing.mouse.y);
                // ctx.closePath();
                // ctx.stroke();
            })
        }
        
    }, [imPlaying])

    const drawOnCanvas = () => {
        
        let canvas = document.getElementById('board') as HTMLCanvasElement;        
        
        let ctx = canvas.getContext('2d') as CanvasRenderingContext2D;        
    
        // let sketch = document.querySelector('#sketch') as HTMLDivElement;
        // let sketch_style = getComputedStyle(sketch);
        canvas.width = parseInt(getComputedStyle(canvas).getPropertyValue('width'));
        canvas.height = parseInt(getComputedStyle(canvas).getPropertyValue('height'));        
    
        let mouse = {x: 0, y: 0};
        let last_mouse = {x: 0, y: 0};
    
        /* Mouse Capturing Work */
        canvas.addEventListener('mousemove', function(e) {
            
            last_mouse.x = mouse.x;
            last_mouse.y = mouse.y;
    
            mouse.x = e.pageX - this.offsetLeft;
            mouse.y = e.pageY - this.offsetTop;
        }, false);
    
    
        /* Drawing on Paint App */
        ctx.lineWidth = 2;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.strokeStyle = 'black';
    
        canvas.addEventListener('mousedown', function(e) {
            canvas.addEventListener('mousemove', onPaint, false);
        }, false);
    
        canvas.addEventListener('mouseup', function() {
            canvas.removeEventListener('mousemove', onPaint, false);
        }, false);


        let onPaint = function() {      
            ctx.beginPath();
            ctx.moveTo(last_mouse.x, last_mouse.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.closePath();
            ctx.stroke();

            let base64ImageData = canvas.toDataURL('image/png')

            let drawingObj = {
                idRoom,
                last_mouse,
                mouse,
                widthOfLine: ctx.lineWidth,
                colorOfLine: ctx.strokeStyle,
                base64ImageData
            }

            socketRef.current.emit("canvas data drawn", drawingObj);
        };

        requestAnimationFrame(onPaint)

    }     
    
    const changePenWidth = (e: any) => {  
        let inputColor = document.querySelector('.color-brush') as HTMLInputElement
        
        let newLineWidth = parseFloat(e.currentTarget.getAttribute('class')) 
        document.querySelector('.eraser')?.classList.remove('picked')       

        let allPenWidth = document.querySelectorAll('.pen-width li');

        allPenWidth.forEach((penWidth) => {
            if (penWidth === e.currentTarget) {                
                penWidth.classList.add('picked')   
            } else {
                penWidth.classList.remove('picked')       
            }
        })
        
        let canvas = document.getElementById('board') as HTMLCanvasElement;        

        let ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

        ctx.lineWidth = newLineWidth;
        ctx.strokeStyle = inputColor.value;
    }

    const changePenColor = (e: any) => {
        let newLineColor = e.currentTarget.value
        
        let canvas = document.getElementById('board') as HTMLCanvasElement;        

        let ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

        ctx.strokeStyle = newLineColor;
    }

    const changePenToEraser = (e: any) => {    

        let allPenWidth = document.querySelectorAll('.pen-width li');

        e.currentTarget.classList.add('picked') 

        allPenWidth.forEach((penWidth) => {
                penWidth.classList.remove('picked')       
        })
        
        let canvas = document.getElementById('board') as HTMLCanvasElement;        

        let ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

        ctx.strokeStyle = 'white';
    }

    return (
        <>
        { imPlaying === true
            ? <div className="col-7 row">            
                <section id="draw">
                    <div className="sketch" id="sketch">
                        <canvas id="board" width="600" height="400"></canvas>    
                    </div>
                </section>
                <div className="col-md-1 d-flex flex-column align-items-start justify-content-between">
                    <div className="color-brush-box">
                        <i className="fas fa-palette"></i>
                        <input onChange={(e) => changePenColor(e)} className="color-brush mx-auto" type="color"/>
                    </div>
                    <div onClick={(e) => changePenToEraser(e)} className="eraser mx-auto"><i className="fas fa-eraser"></i></div>
                    <ul className="pen-width d-flex flex-column justify-content-between mx-auto">                
                        <li className="2 picked" onClick={(e) => changePenWidth(e)} > <span></span> </li>
                        <li className="4" onClick={(e) => changePenWidth(e)} > <span></span> </li>
                        <li className="10" onClick={(e) => changePenWidth(e)} > <span></span> </li>
                        <li className="15" onClick={(e) => changePenWidth(e)} > <span></span> </li>
                        <li className="30" onClick={(e) => changePenWidth(e)} > <span></span> </li>
                    </ul>
                </div>                        
            </div>

            : <div className="col-md-12 row justify-content-center">            
                <section id="draw">
                    <div className="sketch" id="sketch">
                        <canvas id="board" width="600" height="400"></canvas>    
                    </div>
                </section>                   
            </div>
        }            
        </>
    )
}

export default Board
