local resourceName = GetCurrentResourceName()

function BridgeSend(action, data)
    SendNUIMessage({
        action = action,
        data = data,
    })
end

function BridgeShow()
    BridgeSend('setVisible', true)
end

function BridgeHide()
    BridgeSend('setVisible', false)
end

function BridgeNavigate(slug)
    BridgeSend('navigateMinigame', slug)
end

function BridgeConfigure(payload)
    BridgeSend('playMinigame', payload)
end

function BridgeDebugLog(...)
    if GetResourceMetadata(resourceName, 'debug_mode', 0) == 'true' then
        print(string.format('[%s:DEBUG]', resourceName), ...)
    end
end
