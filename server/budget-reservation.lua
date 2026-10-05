local used = tonumber(redis.call('HGET', KEYS[1], 'reservedMicros'))
local cap = tonumber(redis.call('HGET', KEYS[1], 'limitMicros'))
local amount = tonumber(ARGV[1])
local expected = tonumber(ARGV[2])
if not used or not cap or used < 0 or used ~= math.floor(used) or cap ~= expected or used > cap then return -2 end
if not amount or amount <= 0 or amount ~= math.floor(amount) then return -2 end
if redis.call('PTTL', KEYS[1]) ~= -1 then return -2 end
if used + amount > cap then return -1 end
return redis.call('HINCRBY', KEYS[1], 'reservedMicros', amount)
