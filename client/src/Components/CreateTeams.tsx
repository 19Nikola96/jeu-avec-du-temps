import React, { useEffect, useState } from 'react'
import { AdminObj, TeamObj } from '../Types';
import { v4 as uuidv4 } from 'uuid';
import './Style/createTeams.css';

type Props = {
    idRoom: string | number
    socketRef: React.MutableRefObject<any>
}

type TeamPlayers = {
    id: string | number | undefined
    pseudo: string | null | undefined
    playing: boolean
}

const CreateTeams: React.FC<Props> = ({ idRoom, socketRef }) => {

    const [displayAddPlayer, setDisplayAddPlayer] = useState<boolean>(false)
    const [displayAddPlayerByTeamNumber, setDisplayAddPlayerByTeamNumber] = useState<number>(0)
    // DISPLAY //
    const [myId, setMyId] = useState<string | number>()

    const [teamName, setTeamName] = useState<string>('')
    const [teams, setTeams] = useState<TeamObj[]>()
    const [teamPlayers, setTeamPlayers] = useState<TeamPlayers []>([])
    // TEAMS //

    const [users, setUsers] = useState<AdminObj[]>()
    // USERS //

    useEffect(() => {
        setMyId(socketRef.current.id)

        socketRef.current.emit("ask users", idRoom)
        socketRef.current.emit("ask teams", idRoom)
        socketRef.current.emit("ask messages", idRoom)
        
        socketRef.current.on("users", (usersData: AdminObj []) => {                      
            setUsers(usersData);
        })

        socketRef.current.on("teams", (teamsData: TeamObj[]) => {                                                                 
            setTeams(teamsData)
        })

    }, [displayAddPlayer])

    const handleCreateTeam = (e: React.ChangeEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (teamName.length !== 0) {
            let teamId = uuidv4()

            let teamObj = {}

            if (teams?.length === 0) {
                teamObj = {
                    name: teamName,
                    points: 0,
                    players: [],
                    playedCount: 0,
                    idTeam: teamId,
                    playing: true,
                    idRoom
                }
            } else {
                teamObj = {
                    name: teamName,
                    points: 0,
                    players: [],
                    playedCount: 0,
                    idTeam: teamId,
                    playing: false,
                    idRoom
                }
            }
            setTeamName('') 
            socketRef.current.emit("create team", teamObj)
        }
    }

    const displayAddPlayers = (index: number) => {
        setDisplayAddPlayer(!displayAddPlayer)

        setDisplayAddPlayerByTeamNumber(index)
    }

    const handleChangeSelect = (e: any) => {
        let idAlreadyExist
        teamPlayers.map((player) => {
            if (player.id === e.target.value) {                
                idAlreadyExist = true
            }
        })    
        
        if (idAlreadyExist !== true && users !== undefined) {
            users.map((user) => {
                if (user !== null && user !== undefined && user.id === e.target.value) {                    
                    setTeamPlayers([...teamPlayers, {pseudo: user.pseudo, id: user.id, playing: false}])
                } 
            })
        }
    }

    const handleAddPlayerToTeam = (e: any, teamId: string | number) => {
        e.preventDefault()

        const teamPlayerObj = {
            teamPlayers,
            teamId,
            idRoom
        }

        setTeamPlayers([])
        setDisplayAddPlayer(!displayAddPlayer)
        
        socketRef.current.emit("place player in team", teamPlayerObj)
    }

    const handleRemovePlayer = (playerId: string | number | undefined, teamId: string | number) => {        
        
        const removePlayerObj = {
            playerId,
            teamId,
            playing : false,
            idRoom
        }
        
        socketRef.current.emit("remove player from team", removePlayerObj)
    }

    const handleRemoveTeam = (teamId: string | number) => {
        const removeTeamObj = {
            teamId,
            idRoom
        }

        socketRef.current.emit("remove team", removeTeamObj)
    }

    // const handleRemovePlayerFromPreviewTeam = (playerId: string | number | undefined,) => {
    //     setTeamPlayers(prevTeamPlayers => (
    //         prevTeamPlayers.filter((player) => player.id !== playerId)
    //     ))        
    // }

    return (
        <div className="team col-md-7 slide">
            <div>
                <h3 className="mt-2">Équipes</h3>
                <form onSubmit={handleCreateTeam}>
                    <input value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="Nom de l'équipe" className="mx-2 mon-input" type="text"/>
                    <button type="submit" className="mx-2 mon-bouton">Valider</button>
                </form>
            </div> 
                <ul className="row justify-content-center mt-4 px-3">
                    { teams !== undefined
                        ? teams.map((team, index) => {                        
                            return <li className="p-1 my-2 col-md-6 slide" key={index}>
                                    <div className="team-border">
                                        <i onClick={() => handleRemoveTeam(team.idTeam)} className="mon-bouton rounded-circle fas fa-times"></i>
                                        <h4>{team.name}</h4>
                                        <div className="row p-1 justify-content-center">     
                                        <ul className="col-md-8">
                                                {team.players.map((player, index) => {
                                                    return <li className="grow" key={index}>{player.pseudo} <i onClick={() => handleRemovePlayer(player.id, team.idTeam)} className="fas fa-times-circle"></i></li>
                                                })}
                                            </ul>                                       
                                            <button className="col-md-4 my-2 room-bouton rounded" onClick={() => displayAddPlayers(index)} type="button">
                                                Ajouter joueur <i className="fas fa-caret-down"></i>
                                            </button>                                            
                                        </div>                                        
                                        <div className="row justify-content-center">
                                            { displayAddPlayer && displayAddPlayerByTeamNumber === index
                                                ? <form onSubmit={(e) => handleAddPlayerToTeam(e, team.idTeam)} className="col-md-10 p-1 team-form dropdown-unfold">
                                                    <select multiple={true} onChange={handleChangeSelect}>
                                                        { users?.map((user, index) => {                                                            
                                                            if (user.available === true) {
                                                                return <option value={user.id} key={index}>{user.pseudo}</option>                                                                                                                                                                                                
                                                            } 
                                                        })}
                                                    </select>
                                                    <ul>
                                                        { teamPlayers.map((player, index) => {
                                                            return <li className="slide preview-player"
                                                                       key={index}
                                                                       id={`${player.id}`}>
                                                                {player.pseudo} 
                                                                {/* <i onClick={() => handleRemovePlayerFromPreviewTeam(player.id)} 
                                                                   className="mx-1 fas fa-backspace">
                                                                </i>  */}
                                                                <hr/>
                                                            </li>
                                                        })}
                                                    </ul>
                                                    <button className="orange-button" type="submit">
                                                        <i className="fas fa-check"></i>
                                                    </button>
                                                 </form>
        
                                                : ''
                                            }
                                        </div>                                        
                                    </div>
                                   </li>
                        })

                        : ''
                    }
                </ul>
        </div>
    )
}

export default CreateTeams
