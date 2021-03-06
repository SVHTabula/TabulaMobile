import React, { useState, useContext } from "react";
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from "@material-ui/core/TextField";
import FormHelperText from "@material-ui/core/FormHelperText";
import Button from "@material-ui/core/Button";
import Paper from '@material-ui/core/Paper';
import SocketContext from "../context/socket";
import RoomContext from "../context/room";

export default function TheRoomConnectScreen() {
  const { socket } = useContext(SocketContext);
  const { setRoomId } = useContext(RoomContext);

  const [formRoomId, setFormRoomId] = useState('');
  const [roomPassword, setRoomPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  return (
    <Paper variant="outlined" style={{display: 'flex', flexDirection: 'column', marginTop: 30}}>
      <DialogTitle style={{margin: 0, paddingBottom: 5, paddingTop: 10}}>
        <span style={{fontWeight: 'bold'}}>
          Connect to Tabula Room
        </span>
      </DialogTitle>
      <TextField
        label="Room ID"
        type="email"
        variant="outlined"
        style={{marginLeft: 10, marginRight: 10, marginBottom: 0, marginTop: 5}}
        value={formRoomId}
        onChange={(e) => setFormRoomId(e.target.value)}
      />
      <TextField
        label="Admin Password"
        type="password"
        variant="outlined"
        style={{marginLeft: 10, marginRight: 10, marginBottom: 0, marginTop: 5}}
        value={roomPassword}
        onChange={(e) => setRoomPassword(e.target.value)}
      />
      <Button
        variant="contained"
        style={{margin: 10, marginBottom: 5}}
        color="primary"
        onClick={() => {
          socket.emit("connectToRoom", {
            id: formRoomId, password: roomPassword
          }, (response) => {
            console.log(response);
            if (!response.success) {
              setErrorMessage(response.message);
            }
            setRoomId(formRoomId);
          });
        }}
      >Connect</Button>
      <FormHelperText error={true} style={{textAlign: 'center', marginBottom: 5}}>
        {errorMessage}
      </FormHelperText>
    </Paper>
  );
}
