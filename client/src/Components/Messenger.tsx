import React, { useEffect, useState } from 'react'
import { BodyMessageObject } from '../Types'
import ReactScrollableFeed from 'react-scrollable-feed'
import './Style/messenger.css';

type Props = {
    idRoom: string | number
    socketRef: React.MutableRefObject<any>
}

const Messenger: React.FC<Props> = ({ idRoom, socketRef }) => {

    const [myPseudo, setMyPseudo] = useState<string | null>('')
    const [myId, setMyId] = useState<string | number>()
    const [message, setMessage] = useState<string>('')
    const [messages, setMessages] = useState<BodyMessageObject []>([])

    useEffect(() => {
        setMyId(socketRef.current.id)

        socketRef.current.on("messages", (messageBody: BodyMessageObject[]) => {                             
            setMessages(messageBody)
        })

        setMyPseudo(localStorage.getItem('myPseudo'))
    }, [messages])

    const sendMessage = (e: React.ChangeEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (message !== '') {
            const messageObject = {
                body: { 
                    message,
                    myPseudo,
                    id: myId
                }, 
                idRoom
            }
            setMessage('')            
            socketRef.current.emit("send message", messageObject)
        }
    }

    return (
        <div className="col-md-7 messenger slide">
            <h3 className="mt-2">Messages</h3>
            <ul id="messages">
            <ReactScrollableFeed>
                { messages !== undefined
                    ? <>
                        {messages.map((messageBody, index) => {                                                   
                            if (messageBody.id === myId) {
                            return <div key={index} className="new-message row justify-content-end">
                                    <li className="your-message text-end my-2 mr-4 px-3">
                                        <p className="mt-2">{messageBody.message}</p>                            
                                    </li>
                                </div> 
                            } else {
                            return <div key={index} className="new-message row justify-content-start">
                                    <li className="others-message text-start my-2 mr-4 px-3">
                                        <p className="mt-2"> <span>{messageBody.myPseudo}</span> - {messageBody.message}</p>                            
                                    </li>
                                </div> 
                            }
                            
                })}
                    </>

                    : ''
                }
            </ReactScrollableFeed>
            
            </ul>
            <form onSubmit={sendMessage} className="message-form row justify-content-between">
                <input className="send-input" placeholder="Écrit un truc..." value={message} onChange={(e) => setMessage(e.target.value)} />
                <button className="mon-bouton rounded-circle" type="submit" style={{ filter: 'hue-rotate(18deg)'}}><i className="fas fa-paper-plane"></i></button>
            </form>
        </div>
    )
}

export default Messenger
