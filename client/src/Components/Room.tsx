import React, { useEffect, useState } from 'react'
import { AdminObj, DataRoomObjWithKey, RoomObj, RulesObj } from '../Types'
import CreateTeams from './CreateTeams';
import Messenger from './Messenger'
import StartGameTransition from './StartGame';
import './Style/room.css';

type Props = {
    roomData: RoomObj
    error: string
    socketRef: React.MutableRefObject<any>
}

const Room: React.FC<Props> = ({ roomData, error, socketRef }) => {

    const [displayAddWord, setDisplayAddWord] = useState<boolean>(false)
    const [displaySetWordsSize, setDisplaySetWordsSize] = useState<boolean>(false)
    const [displayCreateTeam, setDisplayCreateTeam] = useState<boolean>(false)

    const [displayStartGame, setDisplayStartGame] = useState<boolean>(false)
    // DISPLAY //


    const [word, setWord] = useState<string>('')
    const [words, setWords] = useState<string []>([])
    const [wordsLength, setWordsLength] = useState<number>(0)
    const [allWords, setAllWords] = useState<string []>([])
    // WORDS //

    const [nbrWords, setNbrWords] = useState<number>(5)
    const [time, setTime] = useState<number>(45)
    const [drawTime, setDrawTime] = useState<number>(90)
    const [rules, setRules] = useState<RulesObj>()
    const [round, setRound] = useState<number>()
    // RULES //

    const [users, setUsers] = useState<AdminObj[]>()
    // USERS //

    const inputRef = React.useRef() as React.MutableRefObject<HTMLInputElement>;

    useEffect(() => {
        socketRef.current.emit("ask share rooms", true)
        socketRef.current.emit("ask rules", roomData.id)

        socketRef.current.on("start game prvw", (start: boolean) => {
            setDisplayStartGame(start)
        })

        socketRef.current.on("share rooms", (data: DataRoomObjWithKey) => {                        
            if (roomData.id !== '') {
                Object.keys(data).map((id) => {                    
                    if (roomData.id === id) {
                        setUsers(data[id].users)            
                    }
                    return true
                })
            }
        })

        socketRef.current.on("words", (words: string []) => {
            setAllWords(words)
            
            setWordsLength(words.length);
        })

        socketRef.current.on("rules", (rulesData: RulesObj) => {
            setRules(rulesData);
            // Display "Rules have been updated"
        })

    }, [roomData])


    const copyLink = (e: any) => {
        inputRef.current.select();

        document.execCommand('copy');

        e.target.focus();
    }
    
    const handleAddWord = (e: React.ChangeEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (word.length !== 0) {
            if (rules?.numberOfWords === null && words.length > 2 ) {
                words.splice(words.length ,1)
                setWord('')
                window.alert('Tu ne peux plus ajouter de mots pour le moment ! Il fau attendre que l\' admin de la room mette en place les régles')                
            } else {
                console.log(words.length, '>', rules?.numberOfWords);
                
                if (rules && rules?.numberOfWords !== null && words.length > rules?.numberOfWords - 1) {
                    console.log('test');
                    
                    setWord('')
                    window.alert('Tu ne peux plus ajouter de mots')
                } else {                    
                    setWords([...words, word])
    
                    const wordData = {
                        word: word,
                        idRoom: roomData.id
                    }
    
                    socketRef.current.emit("add word", wordData)
                    setWord('')
                }
            }
        }
    }

    const handleRulesSet = (e: React.ChangeEvent<HTMLFormElement>) => {
        e.preventDefault()        

        const rulesData = {
            numberOfWords: nbrWords,
            time: time,
            timeDraw: drawTime,
            round: 2,
            idRoom: roomData.id,
        }

        socketRef.current.emit("set rules", rulesData)

        setDisplaySetWordsSize(!displaySetWordsSize)
    }

    const startGamePreview = () => {
        socketRef.current.emit("start game preview", roomData.id)

        // socketRef.current.emit("set playing team and player", roomData.id)

        setDisplayStartGame(true)
    }

    return (
        <>
            { displayStartGame
                ? <StartGameTransition socketRef={socketRef} idRoom={roomData.id}/>

                :  <div className="room container grow">
                    {error}
                    <div className="d-flex flex-column justify-content-between align-items-between">
                        <div>
                            <h2 className="mb-3">{roomData === undefined ? '' : roomData.name}</h2>
                            <div className="row">
                                <label>ID Room</label>
                                <div>
                                    <input className="mx-auto copy-input" ref={inputRef} type="text" defaultValue={roomData === undefined ? '' : roomData.id}/>
                                    <button className="mon-bouton mx-2 mb-3 rounded" onClick={(e) => copyLink(e)} style={{ filter: 'hue-rotate(18deg)'}}><i className="fas fa-clone"></i></button>
                                </div>                                
                                <div className="row justify-content-between">
                                    <div className="w-auto">
                                        <button className="room-bouton" onClick={() => setDisplaySetWordsSize(!displaySetWordsSize)} type="button">
                                            Régles <i className="fas fa-caret-down"></i>
                                        </button>
                                        <div className="position-dropdown">
                                            { roomData.admin.id === socketRef.current.id
                                                ? <> 
                                                    { displaySetWordsSize 
                                                        ? <form onSubmit={handleRulesSet} className="dropdowned-item d-flex flex-column dropdown-unfold">
                                                            <label className="text-start">Nombre de mots/joueurs</label>
                                                            <input value={nbrWords} 
                                                                className="w-25"
                                                                onChange={(e) => setNbrWords(parseFloat(e.target.value))} 
                                                                type="number"
                                                                min="3"
                                                                max="1000"       
                                                            />
                                                            <label className="text-start mt-2">Temps Round 1 et 2</label>
                                                            <input value={time} 
                                                                className="w-25"
                                                                onChange={(e) => setTime(parseFloat(e.target.value))} 
                                                                type="number"
                                                                min="5"
                                                                max="1000"       
                                                            />
                                                            <label className="text-start mt-2">Temps Round 3</label>
                                                            <input value={drawTime} 
                                                                className="w-25"
                                                                onChange={(e) => setDrawTime(parseFloat(e.target.value))} 
                                                                type="number"
                                                                min="30"
                                                                max="1000"       
                                                            />   
                                                            <div className="text-end">
                                                                <button className="orange-button" type="submit"><i className="fas fa-check"></i></button>
                                                            </div>
                                                          </form>
                                                        
                                                        : ''
                                                    }
                                                </>
                                            
                                                : <>
                                                    { displaySetWordsSize 
                                                        ? <div className="dropdowned-item d-flex flex-column dropdown-unfold">
                                                            <span>Nombre de mots/joueurs</span>
                                                            <p>{ rules?.numberOfWords === null ? "5" : rules?.numberOfWords }</p>
                                                            <span>Temps round 1 et 2</span>
                                                            <p>{ rules?.numberOfWords === null ? "45" : rules?.time }</p>
                                                            <span>Temps round 3</span>
                                                            <p>{ rules?.numberOfWords === null ? "90" : rules?.timeDraw }</p>                                               
                                                        </div>
    
                                                        : ''
                                                    }
                                                </>
                                            }                                    
                                        </div>
                                    </div>
                                    <div className="w-auto">
                                        <button className="room-bouton" onClick={() => setDisplayAddWord(!displayAddWord)} type="button">
                                            Ajouter un mot <i className="fas fa-caret-down"></i>
                                        </button>
                                        <div className="position-dropdown">
                                            { displayAddWord 
                                                ? <form onSubmit={handleAddWord} className="dropdowned-item row dropdown-unfold justify-content-between">
                                                    <input value={word} onChange={(e) => setWord(e.target.value)} className="w-75 mr-3" type="text"/>
                                                    <button className="orange-button" type="submit"><i className="fas fa-check"></i></button>
                                                </form>
        
                                                : ''
                                            }
                                        </div>
                                    </div>
                                    { roomData.admin.id === socketRef.current.id 
                                        ? <div>
                                            <button className="room-bouton me-1" onClick={() => setDisplayCreateTeam(!displayCreateTeam)}>{displayCreateTeam ? 'Voir Messages' : 'Créer Équipes'}</button>
                                            <button className="room-bouton ms-1" onClick={() => startGamePreview()}>Test Round</button>
                                        </div>

                                        : ''
                                    }
                                    { displayCreateTeam
                                    ? <div className="team-position">
                                        <CreateTeams idRoom={roomData.id} socketRef={socketRef} />
                                    </div> 
                                
                                    : ''                    
                                }  
                                </div>
                            </div>
                        </div>
                        <div className="container">
                            <div className="row mt-3 justify-content-between">
                                <div className="col-md-4 users">
                                    <div className="row justify-content-between">
                                        <p className="word-count-all">{wordsLength}/{rules && users && users?.length > 3 ? rules?.numberOfWords * users?.length : "20"}</p>
                                        <h3 className="mt-2">Joueurs</h3>
                                        <p className="word-count-perso">{words.length}/{rules && rules.numberOfWords !== null ? rules.numberOfWords : "3"}</p>
                                    </div>
                                    <ul>
                                        { users !== undefined
                                            ? users.map((user, index) => {
                                                if (roomData.admin.id === user.id) {
                                                    return <li key={index} className="grow">
                                                                <p>{user.pseudo} <i className="fas fa-star"></i></p>
                                                        </li>
                                                } else {                                        
                                                    return <li key={index} className="grow">
                                                                <p>{user.pseudo}</p>
                                                        </li>
                                                }
                                            })
        
                                            : ''
                                        }
                                    </ul>
                                </div>
                                <Messenger idRoom={roomData.id} socketRef={socketRef} />                              
                            </div>
                        </div>
                    </div>
                </div>

            }
        </>
    )
}

export default Room
