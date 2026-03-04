fx_version 'cerulean'
game 'gta5'
lua54 'yes'

name 'minigames'
description 'Standalone minigame collection for FiveM — based on NoPixel-MiniGames-4.0 by MaximilianAdF (https://github.com/MaximilianAdF/NoPixel-MiniGames-4.0)'
version '2.0.0'

ui_page 'interface/dist/index.html'

client_scripts {
    'runtime/bridge.lua',
    'runtime/orchestrator.lua',
}

files {
    'interface/dist/index.html',
    'interface/dist/**/*',
}
