local sessionActive = false
local sessionOutcome = false

local function lockControls()
    DisableAllControlActions(0)
    DisableAllControlActions(1)
    DisableAllControlActions(2)
end

local function beginSession(slug, payload)
    if sessionActive then return false end

    sessionActive = true
    sessionOutcome = false

    SetNuiFocus(true, true)
    BridgeShow()
    BridgeNavigate(slug)

    Wait(50)

    BridgeConfigure(payload)

    while sessionActive do
        lockControls()
        Wait(0)
    end

    return sessionOutcome
end

local function endSession(outcome)
    sessionOutcome = outcome
    sessionActive = false
    SetNuiFocus(false, false)
    BridgeHide()
end

RegisterNUICallback('finishedMinigame', function(data, cb)
    BridgeDebugLog('Session concluded:', data.result and 'WIN' or 'LOSE')
    endSession(data.result)
    cb('ok')
end)

RegisterNUICallback('closeMinigame', function(_, cb)
    BridgeDebugLog('Session aborted')
    endSession(false)
    cb('ok')
end)

exports('Lockpick', function(title, levels, timer)
    title = title or 'Lockpick'
    levels = levels or 4
    timer = timer or 20

    return beginSession('lockpick', {
        title = title,
        levels = levels,
        timer = timer,
    })
end)

exports('Thermite', function(targetScore, rows, columns, timer)
    targetScore = targetScore or 24
    rows = rows or 6
    columns = columns or 6
    timer = timer or 60

    return beginSession('thermite', {
        targetScore = targetScore,
        rows = rows,
        columns = columns,
        timer = timer,
    })
end)

exports('PinCracker', function(pinLength, timer)
    pinLength = pinLength or 4
    timer = timer or 20

    return beginSession('pincracker', {
        pinLength = pinLength,
        timer = timer,
    })
end)

exports('RoofRunning', function(rows, columns, timer)
    rows = rows or 8
    columns = columns or 11
    timer = timer or 25

    return beginSession('roofrunning', {
        rows = rows,
        columns = columns,
        timer = timer,
    })
end)

exports('Chopping', function(letters, timer)
    letters = letters or 15
    timer = timer or 7

    return beginSession('chopping', {
        letters = letters,
        timer = timer,
    })
end)

exports('WordMemory', function(words, timer)
    words = words or 25
    timer = timer or 25

    return beginSession('wordmemory', {
        words = words,
        timer = timer,
    })
end)
