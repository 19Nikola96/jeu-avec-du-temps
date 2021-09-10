import React, {useState, useEffect, useRef} from 'react'
import { ListFormat } from 'typescript'
import { AdminObj, RulesObj, TeamObj, WordsObj } from '../Types'
import NextRound from './NextRound'
import NextTurn from './NextTurn'

import './Style/timer.css';
import './Style/board.css';
import './Style/game.css';
import Board from './Board'

type Props = {
    idRoom: string | number
    socketRef: React.MutableRefObject<any>
}

const Game1: React.FC<Props>  = ({ idRoom, socketRef }) => {

    const yourPlayingRef: React.MutableRefObject<boolean | undefined> = useRef(false)
    const thisRound: React.MutableRefObject<number> = useRef(0)

    const [displayEndTurn, setDisplayEndTurn] = useState<boolean>(false);
    const [displayNextRound, setDisplayNextRound] = useState<boolean>(false);

    const [round, setRound] = useState<number>(0);

    const [words, setWords] = useState<string []>([]);
    const [actualWord, setActualWord] = useState<string>();
    const [actualRound, setActualRound] = useState<number>();
    const [actualPoints, setActualPoints] = useState<number>(0);
    const [actualPointsDelay, setActualPointsDelay] = useState<number>(0);

    const [actualTeam, setActualTeam] = useState<string>()
    const [actualPlayer, setActualPlayer] = useState<string | null | undefined>()

    const [time, setTime] = useState<number>(1)
    const [forAnimationTime, setForAnimationTime] = useState<number>(100)

    const getRandomInteger = (min: number, max: number) => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    useEffect(() => {
        
        // socketRef.current.emit("ask rules", idRoom)
        // socketRef.current.on("rules", (rulesData: RulesObj) => {
        //     setActualRound(rulesData.round)
        // }) // Surement à modifier

        socketRef.current.emit("ask rules", idRoom)

        socketRef.current.on("rules", (rulesData: RulesObj) => {   
            
            if (rulesData.round === 2) {
                setTime(rulesData.timeDraw)
                setForAnimationTime(rulesData.timeDraw)
            } else {
                setTime(rulesData.time)
                setForAnimationTime(rulesData.time)
            }

            setRound(rulesData.round)

            thisRound.current = rulesData.round; 

            // setTimeout(() => {
            //     clearInterval(interval)
            // }, rulesData.time*1500)            
        })

        socketRef.current.emit("ask words", idRoom);
        socketRef.current.on("words", (words: WordsObj) => {

            let randomNumber: number;

            if (thisRound.current === 0) {
                randomNumber = getRandomInteger(0, words.round1.length - 1)
            } else if (thisRound.current === 1) {
                randomNumber = getRandomInteger(0, words.round2.length - 1)
            } else {
                randomNumber = getRandomInteger(0, words.round3.length - 1)
            }
                        
            if (thisRound.current === 0) {
                words.round1.forEach((word, index) => {
                    if (randomNumber === index) {
                        setActualWord(word)
                    }
                })
                setWords(words.round1);
            } else if (thisRound.current === 1) {
                words.round2.forEach((word, index) => {
                    if (randomNumber === index) {
                        setActualWord(word)
                    }
                })
                setWords(words.round2);
            } else {
                words.round3.forEach((word, index) => {
                    if (randomNumber === index) {
                        setActualWord(word)
                    }
                })
                setWords(words.round3);
            }
        });

        socketRef.current.on("points", (points: number) => {
            setActualPoints(points);
            setTimeout(() => {
                setActualPointsDelay(points)
            }, 1000)
        });

        socketRef.current.emit("ask teams", idRoom);
        socketRef.current.on("teams", (teams: TeamObj []) => {            
            teams.forEach((team) => {
                if (team.playing === true) {                    
                    setActualTeam(team.name)
                    team.players.forEach((player) => {
                        if (player.playing === true) {
                            if (player.id === socketRef.current.id) {                    
                                yourPlayingRef.current = true
                            }  
                            setActualPlayer(player.pseudo)
                        }
                    })
                }
            })
        });

        socketRef.current.on("display next round", (displayBool: boolean) => {
            setDisplayNextRound(displayBool);
        })    

        setInterval(() => {
            setTime(time => time - 1)   
        }, 1000)
        
    }, [])

    useEffect(() => {
        if (yourPlayingRef.current === false) {
            let points = document.querySelectorAll('[class*="part-circle"]')

            for (let index = 0; index < points.length; index++) {
                points[index].classList.add('bubble-animNoDelay')
            }

            setTimeout(() => {
                for (let index = 0; index < points.length; index++) {
                    points[index].classList.remove('bubble-animNoDelay')
                }
            }, 2500)
        }
        
    }, [actualPoints])

    const goodRandomWord = () => {  
        
        let wordCircle = document.querySelector<HTMLElement>('.word')
        let pointsPosition = document.querySelector<HTMLElement>('.position-points')
        let pointsPositionDraw = document.querySelector<HTMLElement>('.position-points-draw')
        let drop = document.querySelector<HTMLElement>('.liquid2')

        let points = document.querySelectorAll('[class*="part-circle"]')
        console.log(points);

        for (let index = 0; index < points.length; index++) {
            points[index].classList.add('bubble-anim')
        }

        if (thisRound.current === 0 || thisRound.current === 1) {
            wordCircle?.classList.add('goodWord-anim');
        } else {
            wordCircle?.classList.add('goodWord-anim-draw');
        }
        

        
        if (pointsPosition !== null) {
            pointsPosition.classList.remove('justify-content-between')
            pointsPosition.style.justifyContent = 'flex-end'
        }      
        
        if (pointsPositionDraw !== null) {
            pointsPositionDraw.classList.remove('justify-content-between')
            pointsPositionDraw.style.justifyContent = 'flex-end'
        }   

        setTimeout(() => {
            pointsPosition?.classList.add('justify-content-between')
            pointsPositionDraw?.classList.add('justify-content-between')
            wordCircle?.classList.remove('goodWord-anim');
            wordCircle?.classList.remove('goodWord-anim-draw');
            drop?.classList.add('drop-anim')
            if (wordCircle !== null) {       
                wordCircle.style.transform = 'scale(1)'
            }
        }, 1000)

        setTimeout(() => {
            for (let index = 0; index < points.length; index++) {
                points[index].classList.remove('bubble-anim')
            }
        }, 2500)
        
        words.forEach((word, index) => {
            if (actualWord === word) {
                words.splice(index, 1)                  
            }
        })
        
        let randomNumber = getRandomInteger(0, words.length - 1)

        words.forEach((word, index) => {
            if (randomNumber === index) {
                setActualWord(word)                
            }
        })        

        let addPointObj = {
            idRoom,
            idPlayer: socketRef.current.id
        }        

        socketRef.current.emit("add point", addPointObj);
        
        if (words.length === 0) {
            nextRound();
        }

        if (thisRound.current === 2) {
            let canvas = document.getElementById('board') as HTMLCanvasElement;        

            let ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

            let inputColor = document.querySelector('.color-brush') as HTMLInputElement

            if (inputColor !== null) {
                inputColor.value = '#000000'
            }

            ctx.clearRect(0, 0, 0, 0)

            canvas.height = 400

            socketRef.current.emit("erase board", idRoom);

            let allPenWidth = document.querySelectorAll('.pen-width li');

            allPenWidth.forEach((penWidth, index) => {
                if (index === 0) {                
                    penWidth.classList.add('picked')   
                } else {
                    penWidth.classList.remove('picked')   
                }
            })

            ctx.lineWidth = 4;
            
        }
        
    }

    const nextRound = () => {
        setDisplayNextRound(true)

        if (yourPlayingRef.current === true) {
            let updatedWordsObj= {
                idRoom,
                words
            }
            
            socketRef.current.emit("update words", updatedWordsObj);
        }

        socketRef.current.emit("next round", idRoom);
    }

    const passRandomWord = () => {
        let randomNumber = getRandomInteger(0, words.length - 1)
        
        do {
            randomNumber = getRandomInteger(0, words.length - 1)
        } while (words[randomNumber] === actualWord);

        words.forEach((word, index) => {
            if (randomNumber === index) {
                setActualWord(word)
            }
        })

        if (thisRound.current === 2) {            
            let canvas = document.getElementById('board') as HTMLCanvasElement;        

            let ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

            let inputColor = document.querySelector('.color-brush') as HTMLInputElement

            if (inputColor !== null) {
                inputColor.value = '#000000'
            }
        
            ctx.clearRect(0, 0, 0, 0)

            canvas.height = 400

            socketRef.current.emit("erase board", idRoom);

            let allPenWidth = document.querySelectorAll('.pen-width li');

            allPenWidth.forEach((penWidth, index) => {
                if (index === 0) {                
                    penWidth.classList.add('picked')   
                } else {
                    penWidth.classList.remove('picked')   
                }
            })

            console.log(ctx.lineWidth);            

            ctx.lineWidth = 4;

            console.log(ctx.lineWidth);
        }
    }

    const endTurn = () => {
        if (yourPlayingRef.current === true) {
            let updatedWordsObj= {
                idRoom,
                words
            }
            
            socketRef.current.emit("update words", updatedWordsObj);
        }
        
        setDisplayEndTurn(true)
    }     

    return (
        <> 
            { displayNextRound
                ? <NextRound socketRef={socketRef} idRoom={idRoom} />

                : <div>
                    { displayEndTurn
                        ? <NextTurn socketRef={socketRef} idRoom={idRoom} playerName={actualPlayer} team={actualTeam} points={actualPoints} />

                        : <div className="transition-game d-flex flex-column" style={{height: '75vh'}}>  
                            <div className="position-chrono">
                                <h5 style={{ height: '20vh'}}>Phase { round + 1 }</h5>
                                <section id="chrono-box">
                                    <div className="chrono">
                                        <div className="skill">
                                            <div className="outer">
                                                <div className="inner">
                                                <div className="timer-number">
                                                    { time < 1
                                                        ? endTurn()

                                                        : ''
                                                    }
                                                    {time}                                                       
                                                </div>
                                                </div>
                                            </div>          
                                        </div> 

                                        <svg width="160px" height="160px">
                                        <defs>
                                            <linearGradient id="GradientColor">
                                                <stop offset="0%" stopColor="#e91e63" />
                                                <stop offset="100%" stopColor="#673ab7" />
                                            </linearGradient>
                                        </defs>
                                        <circle cx="80" cy="80" r="70" strokeLinecap="round" style={{ animation: `timer ${forAnimationTime}s linear infinite`}} />
                                        </svg>
                                    </div>                           
                                </section>
                                <div className="points">                                      
                                    {/* <div className="points-bucket"></div>
                                    <div className="liquid1"></div>
                                    <div className="liquid2"></div> */}
                                    <div className="points-box">
                                        <div className="part-circle1"></div>
                                        <div className="part-circle2"></div>
                                        <div className="part-circle3"></div>
                                        <div className="part-circle4"></div>
                                        <div className="part-circle5"></div>
                                        <div className="part-circle6"></div>
                                        <div className="part-circle7"></div>
                                        <div className="part-circle8"></div>
                                        <div className="part-circle9"></div>
                                        <div className="part-circle10"></div>
                                        <div className="part-circle11"></div>
                                        <div className="part-circle12"></div>             
                                        <span className="empty-circle"></span>      

                                        { yourPlayingRef.current === true
                                            ? <span style={{ marginLeft: '40px' }}>{actualPointsDelay >= 1 ? `${actualPointsDelay} Points` : `${actualPointsDelay} Point`}</span>
                                            
                                            :<span style={{ marginLeft: '40px' }}>{actualPoints >= 1 ? `${actualPoints} Points` : `${actualPoints} Point`}</span>
                                        }                                        
                                    </div>
                                </div>
                            </div>     
                           
                            { thisRound.current === 0 || thisRound.current === 1
                                ? <>
                                    { yourPlayingRef.current === true
                                        ? <div className="d-flex flex-column justify-content-between position-points">
                                            <div className="word">
                                                <div>{actualWord}</div>
                                            </div>                                            
                                            <div className="row col-4 align-items-center mx-auto">                                                
                                                <button onClick={() => passRandomWord()} className="passWord">
                                                    <i className="fas fa-times"></i>
                                                </button>
                                                <button onClick={() => goodRandomWord()} className="goodWord">
                                                    <i className="fas fa-check"></i>
                                                </button>
                                            </div>                                            
                                        </div> 
                        
                                        : <div className="">
                                            <div className="player-name">
                                                {actualPlayer}
                                            </div>       
                                            <p className="text-points">
                                                <span>de la team {actualTeam} et entrain de jouer</span>
                                            </p> 
                                        </div>  
                                    }   
                                  </>

                                : <>
                                    { yourPlayingRef.current === true
                                        ? <div className="row justify-content-between">                                    
                                            <Board socketRef={socketRef} idRoom={idRoom} imPlaying={true} />
                                            <div className="col-5 d-flex flex-column justify-content-between position-points-draw">
                                                <div className="word">
                                                    <div>{actualWord}</div>
                                                </div>                                            
                                                <div className="row align-items-center">                                       
                                                    <button onClick={() => passRandomWord()} className="passWord">
                                                        <i className="fas fa-times"></i>
                                                    </button>
                                                    <button onClick={() => goodRandomWord()} className="goodWord">
                                                        <i className="fas fa-check"></i>
                                                    </button>
                                                </div>                                            
                                            </div> 
                                            
                                        </div> 
                        
                                        : <div className="text-light">
                                            <Board socketRef={socketRef} idRoom={idRoom} imPlaying={false} />
                                        </div>  
                                    }
                                  </>
                            }                  
                
                                                                         
                        </div>
                    }
                 </div>                         
            }
            
        </>
        
    )
}

export default Game1
