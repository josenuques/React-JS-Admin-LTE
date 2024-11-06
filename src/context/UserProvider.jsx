import React, { useState, createContext } from "react"

export const UserContext = createContext()

const UserProvider = ({children}) => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem("sesion_usuario")))

    const iniciarSession = (data) => {
        localStorage.setItem("sesion_usuario", JSON.stringify(data))
        setUser(data)
    }

    const cerrarSession = () => {
        localStorage.removeItem("sesion_usuario")
        setUser(null)
    }

    return (
        <UserContext.Provider value={{ user, iniciarSession, cerrarSession}}>
            {children}
        </UserContext.Provider>
    )
}

export default UserProvider