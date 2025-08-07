
// Keep-alive system to prevent the app from sleeping
const PING_INTERVAL = 10 * 60 * 1000; // 10 minutes in milliseconds

export function startKeepAlive() {
  const baseUrl = process.env.REPL_URL || 'http://localhost:5000';
  
  console.log(`Starting keep-alive system, pinging ${baseUrl} every 10 minutes`);
  
  const pingServer = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/stats`);
      if (response.ok) {
        console.log('Keep-alive ping successful');
      } else {
        console.log('Keep-alive ping failed with status:', response.status);
      }
    } catch (error) {
      console.log('Keep-alive ping error:', error.message);
    }
  };

  // Ping immediately on startup
  pingServer();

  // Set up interval to ping every 10 minutes
  setInterval(pingServer, PING_INTERVAL);
}
