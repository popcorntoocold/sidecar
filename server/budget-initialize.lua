local used = tonumber(ARGV[1])
local cap = tonumber(ARGV[2])
if not used or not cap or used < 0 or cap <= 0 or used > cap or used ~= math.floor(used) or cap ~= math.floor(cap) then return -2 end
if redis.call('EXISTS', KEYS[1]) ~= 0 then return -1 end
redis.call('HSET', KEYS[1], 'reservedMicros', ARGV[1], 'limitMicros', ARGV[2])
return 1
