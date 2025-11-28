// src/utils/networkConfig.js

export const getNetworkConfig = () => {
  const isLocalhost = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1' ||
                      window.location.hostname === '';
  
  if (isLocalhost) {
    return {
      apiUrl: 'http://localhost:5000',
      node1Url: 'http://localhost:8545',
      node2Url: 'http://localhost:8547',
      clientUrl: 'http://localhost:5173'
    };
  } else {
    // For network access, use the current host with backend port
    const currentHost = window.location.hostname;
    return {
      apiUrl: `http://${currentHost}:5000`,
      node1Url: `http://${currentHost}:8545`,
      node2Url: `http://${currentHost}:8547`,
      clientUrl: `http://${currentHost}:${window.location.port}`
    };
  }
};

export const API_BASE_URL = getNetworkConfig().apiUrl;