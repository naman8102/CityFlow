import axios from 'axios';
import { getTabToken } from '../utils/sessionManager';

const API_BASE = 'http://localhost:5000/api';

const getAuthToken = () => getTabToken();

const client = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

client.interceptors.request.use(config => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Cross-tab broadcast channel for instantaneous zero-latency sync
let broadcastChannel = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel('cityflow_sos_channel');
  }
} catch {
  // Graceful fallback
}

export const broadcastLocalSosAction = (actionType, payload) => {
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage({ type: actionType, payload, timestamp: Date.now() });
    } catch {
      // Ignore
    }
  }
};

export const sosAPI = {
  createRequest: async (payload = {}) => {
    const res = await client.post('/sos/request', payload);
    if (res.data?.request) {
      broadcastLocalSosAction('SOS_CREATED', res.data.request);
    }
    return res.data;
  },

  getMyStatus: async () => {
    const res = await client.get('/sos/my-status');
    return res.data;
  },

  getAllRequests: async () => {
    const res = await client.get('/sos/requests');
    return res.data;
  },

  verifyRequest: async (id) => {
    const res = await client.post(`/sos/${id}/verify`);
    if (res.data?.request) {
      broadcastLocalSosAction('SOS_VERIFIED', res.data.request);
    }
    return res.data;
  },

  proceedRequest: async (id) => {
    const res = await client.post(`/sos/${id}/proceed`);
    if (res.data?.request) {
      broadcastLocalSosAction('SOS_ACTIVATED', {
        ...res.data.request,
        emergencyData: res.data.emergencyData,
        vipRoute: res.data.vipRoute,
        vipData: res.data.vipData
      });
    }
    return res.data;
  },

  activateVipRequest: async (id) => {
    const res = await client.post(`/sos/${id}/activate-vip`);
    if (res.data?.request) {
      broadcastLocalSosAction('VIP_SOS_ACTIVATED', {
        ...res.data.request,
        vipRoute: res.data.vipRoute,
        vipData: res.data.vipData
      });
      broadcastLocalSosAction('SOS_ACTIVATED', {
        ...res.data.request,
        vipRoute: res.data.vipRoute,
        vipData: res.data.vipData
      });
    }
    return res.data;
  },

  resolveRequest: async (id) => {
    const res = await client.post(`/sos/${id}/resolve`);
    if (res.data?.request) {
      broadcastLocalSosAction('SOS_RESOLVED', res.data.request);
    }
    return res.data;
  },

  subscribeStream: (onEvent, onError) => {
    const token = getAuthToken();
    const url = `${API_BASE}/sos/stream?token=${encodeURIComponent(token)}`;
    let eventSource = null;

    try {
      eventSource = new EventSource(url);

      eventSource.onopen = () => {
        // Connected
      };

      const handleEvent = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          onEvent(parsed);
        } catch {
          // Ignore non-JSON
        }
      };

      eventSource.addEventListener('SOS_CREATED', handleEvent);
      eventSource.addEventListener('SOS_VERIFIED', handleEvent);
      eventSource.addEventListener('SOS_ACTIVATED', handleEvent);
      eventSource.addEventListener('SOS_RESOLVED', handleEvent);

      eventSource.onmessage = (e) => {
        try {
          const parsed = JSON.parse(e.data);
          if (parsed.type === 'CONNECTED') return;
          onEvent(parsed);
        } catch {
          // Ignore
        }
      };

      eventSource.onerror = (err) => {
        if (onError) onError(err);
      };
    } catch (e) {
      if (onError) onError(e);
    }

    // Also listen to local cross-tab BroadcastChannel
    const channelHandler = (e) => {
      if (e.data && e.data.type) {
        onEvent({ eventType: e.data.type, payload: e.data.payload, source: 'BROADCAST_CHANNEL' });
      }
    };

    if (broadcastChannel) {
      broadcastChannel.addEventListener('message', channelHandler);
    }

    return () => {
      if (eventSource) eventSource.close();
      if (broadcastChannel) {
        broadcastChannel.removeEventListener('message', channelHandler);
      }
    };
  }
};
