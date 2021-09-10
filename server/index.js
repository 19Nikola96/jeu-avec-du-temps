const express = require('express')
const http = require('http')
const app = express()
const server = http.createServer(app)
const socket = require('socket.io') (http, {
    cors: {
        origin: "*"
    }
})
const io = socket(server)

const cors = require('cors')

let rooms = {}

io.on('connection', (socket) => {    

    socket.emit("your id", socket.id)

    socket.emit("available rooms", rooms)
    
    socket.on("create room", (room) => {
        socket.join(room.id)        
        let users = []

        let roomId = room.id

        let user = {
            pseudo: room.admin.pseudo,
            id: room.admin.id,
            admin: room.admin.admin,
            available: true,
            playing: false
        }

        users = [...users, user]

        let words = {
            round1: [
                'Iron Man',
                'Hulk',
                'Mario',
                'Zelda',
                'Link',
                'Batman',
                'Superman',
                'Fox',
                'Falco',
                'Captain Falcon',
                'Frodon',
                'Gandalf',
                'Sam Gamegie',
                'Gollum',
                'Dr Mario',
                'Luigi',
                'Bowser',
                'Marth',
                'Diddy Kong',
                'Roy',
            ],
            round2: [
                'Iron Man',
                'Hulk',
                'Mario',
                'Zelda',
                'Link',
                'Batman',
                'Superman',
                'Fox',
                'Falco',
                'Captain Falcon',
                'Frodon',
                'Gandalf',
                'Sam Gamegie',
                'Gollum',
                'Dr Mario',
                'Luigi',
                'Bowser',
                'Marth',
                'Diddy Kong',
                'Roy',
            ],
            round3: [
                'Iron Man',
                'Hulk',
                'Mario',
                'Zelda',
                'Link',
                'Batman',
                'Superman',
                'Fox',
                'Falco',
                'Captain Falcon',
                'Frodon',
                'Gandalf',
                'Sam Gamegie',
                'Gollum',
                'Dr Mario',
                'Luigi',
                'Bowser',
                'Marth',
                'Diddy Kong',
                'Roy',
            ],
        }
        let messages = []
        let teams = []
        let rules = {
            numberOfWords: null,
            time: null,
            timeDraw: null,
            round: 0,
        }        

        rooms = {...rooms, [roomId]: {users, room, words, messages, teams, rules}}
                
        io.to(room.id).emit("share room", room)
    })

    socket.on("join room", (joinObj) => {
        roomId = joinObj.roomIdCopy        

        let user = {
            pseudo: joinObj.pseudo,
            id: joinObj.id,
            admin: joinObj.admin,
            available: true,
            playing: false
        }

        let roomData

        Object.keys(rooms).map((id) => {
            if (id === joinObj.roomIdCopy) {
                socket.join(joinObj.roomIdCopy)
                rooms[id].users.push(user)
                roomData = rooms[id]

                io.to(joinObj.roomIdCopy).emit("share room", roomData.room)
            }
        })
    })

    socket.on("ask share rooms", bool => {
        if (rooms.length !== 0) {
            io.emit("share rooms", rooms)
        }
    })
    
    socket.on("send message", (message) => {   
        Object.keys(rooms).map((id) => {
            if (id === message.idRoom) {
                socket.join(id)
                rooms[id].messages.myId = socket.id
                rooms[id].messages.push(message.body)

                io.to(id).emit("messages", rooms[id].messages)
            }
        })
    })

    socket.on("add word", (wordData) => {   
        Object.keys(rooms).map((id) => {
            if (id === wordData.idRoom) {
                rooms[id].words.round1.push(wordData.word)
                rooms[id].words.round2.push(wordData.word)
                rooms[id].words.round3.push(wordData.word)

                io.to(id).emit("words", rooms[id].words)
            }
        })
    })

    socket.on("set rules", (rulesData) => {   
        Object.keys(rooms).map((id) => {
            if (id === rulesData.idRoom) {
                rooms[id].rules.numberOfWords = rulesData.numberOfWords
                rooms[id].rules.time = rulesData.time
                rooms[id].rules.timeDraw = rulesData.timeDraw

                io.to(id).emit("rules", rooms[id].rules)
            }
        })
    })

    socket.on("ask rules", idRoom => {
        Object.keys(rooms).map((id) => {
            if (id === idRoom) {
                io.to(id).emit("rules", rooms[id].rules)
            }
        })
    })

    socket.on("ask messages", idRoom => {
        Object.keys(rooms).map((id) => {
            if (id === idRoom) {
                io.to(id).emit("messages", rooms[id].messages)
            }
        })
    })

    socket.on("ask room", idRoom => {
        Object.keys(rooms).map((id) => {
            if (id === idRoom) {
                io.to(id).emit("room", rooms[id].room)
            }
        })
    })

    socket.on("ask users", idRoom => {
        Object.keys(rooms).map((id) => {
            if (id === idRoom) {
                io.to(id).emit("users", rooms[id].users)
            }
        })
    })

    socket.on("ask teams", idRoom => {
        Object.keys(rooms).map((id) => {
            if (id === idRoom) {
                io.to(id).emit("teams", rooms[id].teams)
            }
        })
    })

    socket.on("ask words", idRoom => {
        Object.keys(rooms).map((id) => {
            if (id === idRoom) {
                io.to(id).emit("words", rooms[id].words)
            }
        })
    })

    socket.on("create team", (teamObj) => {   
        Object.keys(rooms).map((id) => {
            if (id === teamObj.idRoom) {
                rooms[id].teams.push(teamObj)
                io.to(id).emit("teams", rooms[id].teams)
            }
        })
    })

    socket.on("place player in team", (teamPlayerObj) => {   
        Object.keys(rooms).map((id) => {
            if (id === teamPlayerObj.idRoom) {
                rooms[id].teams.map((team) => {
                    if (team.idTeam === teamPlayerObj.teamId) {
                        if (team.players.length === 0) {                            
                            team.players = teamPlayerObj.teamPlayers

                            team.players[0].playing = true

                            // team.players.map((player) => {
                            //     rooms[id].users.map((user) => {
                            //         if (user.id === player.id && team.players.length === 1 && rooms[id].teams.length === 1) {
                            //             user.playing = true;
                            //         }
                            //     })
                            // })
                        } else {
                            teamPlayerObj.teamPlayers.forEach(player => {
                                team.players.push(player)
                            })
                        }

                        team.players.map((player) => {
                            rooms[id].users.map((user) => {
                                if (user.id === player.id) {
                                    user.available = false
                                }
                            })
                        })
                    }
                })
                io.to(id).emit("teams", rooms[id].teams)
            }
        })
    })

    socket.on("remove team", (removeTeamObj) => {   
        Object.keys(rooms).map((id) => {
            if (id === removeTeamObj.idRoom) {
                rooms[id].teams.map((team, index) => {
                    if (team.idTeam === removeTeamObj.teamId) {

                        team.players.forEach((player, index) => {
                            rooms[id].users.map((user) => {
                                if (player.id === user.id) {                                    
                                    user.available = true
                                }
                            })
                        })
                        
                        team.players.forEach((player, index) => {
                            team.players.splice(index, 1)
                        })                        

                        rooms[id].teams.splice(index, 1)
                    }
                })
                io.to(id).emit("teams", rooms[id].teams)
            }
        })
    })

    socket.on("remove player from team", (removePlayerObj) => {   
        Object.keys(rooms).map((id) => {
            if (id === removePlayerObj.idRoom) {
                rooms[id].teams.map((team) => {
                    if (team.idTeam === removePlayerObj.teamId) {
                        
                        team.players.forEach((player, index) => {
                            if (player.id === removePlayerObj.playerId) {
                                team.players.splice(index, 1)  
                            }
                        })                        

                        rooms[id].users.map((user) => {
                            if (user.id === removePlayerObj.playerId) {
                                user.available = true
                            }
                        })
                    }
                })
                io.to(id).emit("teams", rooms[id].teams)
            }
        })
    })

    socket.on("start game preview", idRoom => {
        Object.keys(rooms).map((id) => {
            if (id === idRoom) {
                io.to(id).emit("start game prvw", true)
            }
        })
    })

    socket.on("start game", idRoom => {
        Object.keys(rooms).map((id) => {
            if (id === idRoom) {
                io.to(id).emit("start game now", true)
            }
        })
    })

    socket.on("set playing team and player", idRoom => {
        Object.keys(rooms).map((id) => {
            if (id === idRoom) {
                rooms[id].teams.forEach((team) => {
                    if (team.playing === true) {
                        team.playedCount++

                        if (team.playedCount !== team.players.length) {
                            let indexPlayer = team.players.findIndex((player) => player.playing === true)

                            team.players[indexPlayer].playing = false
                            team.players[indexPlayer + 1].playing = true
                        } else {
                            team.players.forEach((player, index) => {
                                if (index === 0 ) {
                                    player.playing = true
                                } else {
                                    player.playing = false
                                }
                            })
                            team.playedCount = 0
                        }                        
                    }
                })

                if (rooms[id].room.teamPlayedCount !== rooms[id].teams.length - 1) {
                    rooms[id].room.teamPlayedCount++
                } else {
                    rooms[id].room.teamPlayedCount = 0
                }

                let indexTeamPlayedCount = rooms[id].room.teamPlayedCount

                rooms[id].teams.forEach((team, index) => {
                    if (index === indexTeamPlayedCount) {
                        team.playing = true
                    } else {
                        team.playing = false
                    }
                })

                // rooms[id].teams[indexTeamPlayedCount].playing = true
                // if (indexTeamPlayedCount !== 0) {                 
                //     rooms[id].teams[indexTeamPlayedCount - 1].playing = false
                // }
            }
        })
    })

    socket.on("add point", addPointObj => {
        let teamPlaying;

        Object.keys(rooms).map((id) => {
            if (id === addPointObj.idRoom) {
                rooms[id].teams.map((team) => {
                    team.players.forEach((player) => {
                        if (Object.values(player).includes(addPointObj.idPlayer)) {
                            teamPlaying = team;
                        }
                        
                    })
                })                
            }
        })

        teamPlaying.points++;

        io.to(addPointObj.idRoom).emit("points", teamPlaying.points)
    });

    socket.on("update words", (updatedWordsObj) => {
        Object.keys(rooms).map((id) => {
            if (id === updatedWordsObj.idRoom) {

                // if (updatedWordsObj.words.length === 0) {
                //     io.to(updatedWordsObj.idRoom).emit("End Round", true)
                // }

                if (rooms[id].rules.round === 0) {

                    rooms[id].words.round1 = updatedWordsObj.words
                    
                } else if(rooms[id].rules.round === 1) {

                    rooms[id].words.round2 = updatedWordsObj.words
                    
                } else {
                    rooms[id].words.round3 = updatedWordsObj.words
                }

            }
        })
    })

    socket.on("next round", (idRoom) => {   
        Object.keys(rooms).map((id) => {
            if (id === idRoom) {
                rooms[id].rules.round++;
                io.to(idRoom).emit("display next round", true)
            }
        })
    })

    socket.on("canvas data drawn", (dataDrawn) => {
        Object.keys(rooms).map((id) => {
            if (id === dataDrawn.idRoom) {
                io.to(dataDrawn.idRoom).emit("canvas data drawn img", dataDrawn)
            }
        })
    })

    socket.on("erase board", (idRoom) => {
        Object.keys(rooms).map((id) => {
            if (id === idRoom) {
                io.to(idRoom).emit("board erased", true)
            }
        })
    })
})

server.listen(process.env.REACT_APP_API_URL || 3000, () => {
    console.log('Server is running');
})