import Redis from 'ioredis'

const redisclient = new Redis({
    maxRetriesPerRequest : null
});

export default redisclient;