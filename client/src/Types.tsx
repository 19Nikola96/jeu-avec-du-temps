export type RoomObj = {
    name: string
    id: string | number
    admin: AdminObj
    teamPlayedCount: number
}

export type DataRoomObjWithKey = {
    [key: string]: DataRoomObj
}

export type DataRoomObj = {
    users: AdminObj []
    room: RoomObj
    words: string []
    teams: TeamObj[]
    rules: RulesObj
}

export type TeamObj = {
    name: string
    points: number
    players: AdminObj []
    playing: boolean
    playedCount: number
    idTeam: string | number
    idRoom: string | number
}

export type AdminObj = {
    id: string | number | undefined
    pseudo: string | null | undefined
    admin: boolean | null | undefined
    available: boolean | null | undefined
    playing: boolean
} 

export type WordsObj = {
    round1: string []
    round2: string []
    round3: string []
}

export type RulesObj = {
    numberOfWords: number
    time: number
    timeDraw: number
    round: number
    idRoom: string | number
}

export type BodyMessageObject = {
    message: string
    myPseudo: string | null | undefined
    id: string | number | undefined
}
export type MessageObject = {
    body: BodyMessageObject
    idRoom: string
}