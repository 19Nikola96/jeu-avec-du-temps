import React, { useState, useEffect, useRef } from 'react'
import io from 'socket.io-client'
import { v4 as uuidv4 } from 'uuid';
import Room from './Room';
import { DataRoomObjWithKey, RoomObj } from '../Types'

const CreateJoinRoom= () => {

    const emptyRoom = { name: '',
                        id: '',
                        admin: { id: '', pseudo: '', admin: false, available: true, playing: false },
                        teamPlayedCount: 0
                    }

    const [displayJoin, setDisplayJoin] = useState(false)
    const [displayCreate, setDisplayCreate] = useState(false)
    const [displayRoom, setDisplayRoom] = useState(false)
    const [allRooms, setAllRooms] = useState<DataRoomObjWithKey>({})

    // DISPLAY //
    const [myPseudo, setMyPseudo] = useState<string | null>()
    const [myId, setMyId] = useState<string | number>()
    const [roomData, setRoomData] = useState<RoomObj>(emptyRoom)
    const [roomName, setRoomName] = useState('')
    const [roomIdCopy, setRoomIdCopy] = useState('')
    const [error, setError] = useState<string>('')

    const socketRef: React.MutableRefObject<any> = useRef()

    useEffect(() => {
        socketRef.current = io.connect('https://arcane-hamlet-59795.herokuapp.com/')

        socketRef.current.on("your id", (id: string | number) => {
            setMyId(id)
        })    
        
        socketRef.current.on("available rooms", (rooms: DataRoomObjWithKey) => {
            setAllRooms(rooms)            
        })   

        socketRef.current.on("throw link error", (error: string) => { 
            console.log('error');
                       
            setError(error)
        })

        setMyPseudo(localStorage.getItem('myPseudo'))
    }, [])

    const dynamicDisplayJoin = () => {
        setDisplayJoin(!displayJoin)
        setDisplayCreate(false)
    }

    const dynamicDisplayCreate = () => {
        setDisplayCreate(!displayCreate)
        setDisplayJoin(false)
    }

    const handleSubmitCreate = (e: React.ChangeEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (roomName !== '') {
            let roomId = uuidv4()

            const room: RoomObj = {
                name: roomName,
                id: roomId,
                admin: { id: myId, pseudo: myPseudo, admin: true, available: true, playing: false },
                teamPlayedCount: 0
            }

            setRoomData(room)
            
            socketRef.current.emit("create room", room)
            socketRef.current.emit("share room", room)
            
            setDisplayRoom(true)
        }
    }


    const handleSubmitJoin = (e: React.ChangeEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (roomIdCopy !== '') {

            const joinObj = {
                roomIdCopy, id: myId, pseudo: myPseudo, admin: false
            }

            socketRef.current.emit("join room", joinObj)

            socketRef.current.on("share room", (room: RoomObj) => {                
                setRoomData(room)
            })
            
            setDisplayRoom(true)
        }    
    }

    return (
        <>
            { displayRoom 
                ? <Room roomData={roomData} error={error} socketRef={socketRef}/> 
            
                : <div className="d-flex flex-column mx-auto w-75 text-center grow">
                    <h2>Hello {myPseudo}</h2>
                    <div className="d-flex justify-content-center mt-2">
                        <button onClick={() => dynamicDisplayCreate()} className="mon-bouton mx-2">Créer une room</button>
                        <button onClick={() => dynamicDisplayJoin()} className="mon-bouton mx-2">Rejoindre une room</button>
                    </div>
                    <div className="d-flex justify-content-center mt-4">
                        { displayCreate
                            ? <form onSubmit={handleSubmitCreate} className="row grow">
                                <input onChange={(e) => setRoomName(e.target.value)} className="mon-input" placeholder="Nom de la room" type="text"/>
                                <button className="mon-bouton mx-3" type="submit">Go !</button>
                            </form> 
                        
                            : ''
                        }
                        { displayJoin
                            ? <form onSubmit={handleSubmitJoin} className="row grow">
                                <input onChange={(e) => setRoomIdCopy(e.target.value)} className="mon-input" placeholder="Lien de la room" type="text"/>
                                <button className="mon-bouton mx-3" type="submit">Go !</button>
                            </form> 
                        
                            : ''
                        }                                                
                    </div>
                    <ul>
                        {                        
                            Object.keys(allRooms).map((id, index) => {
                                return <li className="text-light" key={id + index}>{id}</li> 
                            })                   
                        }
                    </ul>
                  </div>
            }  
        </>

        
    )
}

export default CreateJoinRoom
