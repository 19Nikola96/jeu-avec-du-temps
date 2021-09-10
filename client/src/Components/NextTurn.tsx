import React, { useEffect, useRef, useState } from 'react'
import { RoomObj, TeamObj } from '../Types'
import StartGameTransition from './StartGame';

type Props = {
    playerName: string | null | undefined
    team: string | undefined
    points: number
    idRoom: string | number
    socketRef: React.MutableRefObject<any>
}

const NextTurn: React.FC<Props> = ({ playerName, team, points, idRoom, socketRef }) => {

    const yourPlayingRef: React.MutableRefObject<boolean | undefined> = useRef(false)

    const [displayStartGame, setDisplayStartGame] = useState(false)
    // const [updateTeamPlayedCount, setUpdateTeamPlayedCount] = useState<number>(0)

    useEffect(() => {
        socketRef.current.on("start game prvw", (start: boolean) => {
            setDisplayStartGame(start)
        })

        // socketRef.current.emit("ask room", idRoom);

        // socketRef.current.on("room", (room: RoomObj) => {
        //     setUpdateTeamPlayedCount(room.teamPlayedCount)
        // });

        socketRef.current.emit("ask teams", idRoom);

        socketRef.current.emit("ask teams", idRoom);
        socketRef.current.on("teams", (teams: TeamObj []) => {            
            teams.forEach((team) => {
                if (team.playing === true) {                    
                    team.players.forEach((player) => {
                        if (player.playing === true) {
                            if (player.id === socketRef.current.id) {                    
                                yourPlayingRef.current = true
                            }  
                        }
                    })
                }
            })
        });
    }, [])

    const startGamePreview = () => {
        socketRef.current.emit("start game preview", idRoom)

        socketRef.current.emit("set playing team and player", idRoom)

        setDisplayStartGame(true)
    }

    return (
        <>
            { displayStartGame
                ? <StartGameTransition socketRef={socketRef} idRoom={idRoom} />

                : <div className="transition-game d-flex flex-column justify-content-center align-itmes-center" style={{height: '75vh'}}>      
                    <div className="player-name">
                        {playerName}
                    </div>       
                    <p className="text-points">
                       <span> a remporté <span className="team-name">{points}</span> {points <= 1 ? 'point' : 'points'} pour la team  </span> <span className="team-name ms-1"> {team} </span>
                    </p>                        
                    { yourPlayingRef.current === true
                        ? <button onClick={() => startGamePreview()} className="mon-bouton mx-auto">
                            Suivant
                        </button>  

                        :''
                    }
                    
                  </div>      
            }            
        </>
    )
}

export default NextTurn