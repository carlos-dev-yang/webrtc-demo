import io from 'socket.io-client';

const socket = io('http://localhost:8080');

socket.on('connect', () => {
  console.log(socket.id);
});

socket.on('hello', (arg) => {
  console.log(arg);
});

socket.on('disconnect', () => {
  console.log(socket.id);
});

export function IO() {
  const handleSendData = () => {
    socket.emit('hello', 't e s t');
  };
  return (
    <div>
      <button onClick={handleSendData}>send data</button>
    </div>
  );
}
