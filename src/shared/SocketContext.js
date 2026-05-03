import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState } from 'react';
import { useBank } from './BankContext';
const SocketContext = createContext(undefined);
export const SocketProvider = ({ children, onCommand }) => {
    const [socket, setSocket] = useState(null);
    const [activeUsers, setActiveUsers] = useState({});
    const [logs, setLogs] = useState([]);
    const [deployOutput, setDeployOutput] = useState([]);
    const { user, updateAccount, fetchGlobalSettings } = useBank();
    // Simulated socket interactions
    const sendCommand = (targetSocketId, command, payload) => {
        console.log('Simulated send command:', { targetSocketId, command, payload });
    };
    const emitAction = (action, details) => {
        console.log('Simulated emit action:', { action, details });
    };
    const on = (event, callback) => {
        console.log('Simulated on:', event);
    };
    const off = (event, callback) => {
        console.log('Simulated off:', event);
    };
    return (_jsx(SocketContext.Provider, { value: { socket, activeUsers, logs, deployOutput, sendCommand, emitAction, on, off }, children: children }));
};
export const useSocket = () => {
    const context = useContext(SocketContext);
    if (context === undefined) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};
