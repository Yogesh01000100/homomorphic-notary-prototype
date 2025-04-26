import axios from 'axios';
(async () => {
  const resp = await axios.get('http://localhost:3000/read/user1');
  console.log('Encrypted blob:', resp.data.encrypted);
})();
