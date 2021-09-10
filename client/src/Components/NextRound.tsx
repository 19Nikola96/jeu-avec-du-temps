import React, { useEffect, useRef, useState } from 'react'
import { RulesObj, TeamObj } from '../Types'
import StartGame from './StartGame'

type Props = {
    idRoom: string | number
    socketRef: React.MutableRefObject<any>
}

const NextRound: React.FC<Props> = ({ idRoom, socketRef }) => {

    const yourPlayingRef: React.MutableRefObject<boolean | undefined> = useRef(false)

    const [teams, setTeams] = useState<TeamObj []>()
    const [round, setRound] = useState<number>(0)
    const [displayStartGame, setDisplayStartGame] = useState(false)

    useEffect(() => {
        socketRef.current.on("start game prvw", (start: boolean) => {
            setDisplayStartGame(start)
        })

        socketRef.current.emit("ask rules", idRoom)
        socketRef.current.on("rules", (rulesData: RulesObj) => {
            setRound(rulesData.round)
        })

        socketRef.current.emit("ask teams", idRoom);
        socketRef.current.on("teams", (teams: TeamObj []) => {   
            setTeams(teams)
            
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

    const startNextRound = () => {
        socketRef.current.emit("start game preview", idRoom)        

        socketRef.current.emit("set playing team and player", idRoom)

        setDisplayStartGame(true)
    }

    return (
        <>
            { displayStartGame
                ? <StartGame socketRef={socketRef} idRoom={idRoom} />

                : <>
                    <h5>Phase {round} fini !</h5>

                    <div className="row justify-content-between mx-auto" style={{ width: '80%'}}>
                        {teams?.map((team, index) => {


                            return <>
                                    <div className="team-results col-md-3 grow">
                                        <h4>{team.name}</h4> 
                                        <p> {team.points} {team.points <= 1 ? 'point' : 'points'}</p> 
                                    </div>
                                </>
                        })}
                    </div>                    

                    { yourPlayingRef.current === true
                        ? <button onClick={() => startNextRound()} className="mon-bouton mx-auto">
                            Phase suivante !
                        </button>

                        :''
                    }
                    
                  </>

            }
            
        </>
    )
}

export default NextRound
