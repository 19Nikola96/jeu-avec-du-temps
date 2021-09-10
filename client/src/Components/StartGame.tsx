import React, { useEffect, useRef, useState } from 'react'
import { AdminObj, RulesObj, TeamObj } from '../Types';
import Game1 from './Game1';
import './Style/startGame.css';
import WaitingAnim from './WaitingAnim';

type Props = {
    idRoom: string | number
    socketRef: React.MutableRefObject<any>
}

type TeamPlayers = {
    id: string | number | undefined
    pseudo: string | null | undefined
}

const StartGame: React.FC<Props> = ({ idRoom, socketRef }) => {

    const [startGamePreview, setStartGamePreview] = useState<boolean>(false)
    const yourPlayingRef: React.MutableRefObject<boolean | undefined> = useRef(false)
    // DISPLAY

    const [actualTeam, setActualTeam] = useState<string>()
    const [actualPlayer, setActualPlayer] = useState<string | null | undefined>()
    const [actualPlayerId, setActualPlayerId] = useState<string | number | undefined>()

    const [teams, setTeams] = useState<TeamObj[]>()
    const [teamPlayers, setTeamPlayers] = useState<TeamPlayers []>([])

    const [users, setUsers] = useState<AdminObj[]>()

    const [round, setRound] = useState<number>(0)

    useEffect(() => {
        socketRef.current.emit("ask teams", idRoom);
        socketRef.current.on("teams", (teams: TeamObj []) => {
            yourPlayingRef.current = false
            
            teams.forEach((team) => {
                if (team.playing === true) {                    
                    setActualTeam(team.name)
                    team.players.forEach((player) => {
                        if (player.playing === true) {
                            if (player.id === socketRef.current.id) {                                                    
                                yourPlayingRef.current = true
                            }  
                            setActualPlayer(player.pseudo)
                            setActualPlayerId(player.id)
                        }
                    })
                }
            })
        });

        socketRef.current.on("start game now", (start: boolean) => {
            setStartGamePreview(start)
        })

        socketRef.current.emit("ask rules", idRoom)
        socketRef.current.on("rules", (rulesData: RulesObj) => {
            setRound(rulesData.round)
        })
    }, [])

    const startGame = () => {
        socketRef.current.emit("start game", idRoom)
        setStartGamePreview(true)
    }

    return (
        <>                    
            { startGamePreview
                ? <Game1 socketRef={socketRef} idRoom={idRoom} />

                : <div className="transition-game">
                    { yourPlayingRef.current === true
                        ? <>
                            <h5>C'est à toi de jouer !</h5>
                            <div className="d-flex flex-column justify-content-center align-items-center" style={{height: '63vh'}}>                            
                                <button onClick={() => startGame()} className="start-bouton">Let's Go</button>
                            </div> 
                        </>

                        : <div className="d-flex flex-column justify-content-center align-items-center" style={{height: '75vh'}}>
                            <h5>Prochain joueur</h5>
                            <div className="player-name">{actualPlayer}</div>
                            <WaitingAnim />
                          </div>                        
                    }     
                </div>      
            }            
        </>
    )
}

export default StartGame
