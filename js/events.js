// Auto-generated Event Bindings
// This file maps stripped inline handlers to their elements

export default function bindExtractedEvents() {

    document.querySelectorAll('[data-evt-bind="evt-bind-73015b72"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.closeAllMenus(event)
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-62bf3b8f"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.app.handleSpin()
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-50dcf359"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.app.undo()
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-e57a671c"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.app.baccarat.undo()
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-41a00a26"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.app.dragontiger.undo()
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-5176021e"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.toggleFilterMenu(event)
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-1eac46c9"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.toggleBetsModal()
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-5732775d"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.toggleAnalytics()
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-f6ef5f46"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.toggleMainMenu(event)
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-175d07ae"]').forEach(el => {
        el.addEventListener('click', function(event) {
            if(event.target === this) window.app.baccarat.closePatternLog()
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-bf897946"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.app.baccarat.closePatternLog()
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-457f74e6"]').forEach(el => {
        el.addEventListener('click', function(event) {
            if(event.target === this) window.app.dragontiger.closePatternLog()
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-4385922e"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.app.dragontiger.closePatternLog()
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-0721aed7"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.app.roulette.closeAllMenus(event)
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-fc4ff546"]').forEach(el => {
        el.addEventListener('change', function(event) {
            window.toggleCategorySelection(this.checked)
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-2aa53970"]').forEach(el => {
        el.addEventListener('change', function(event) {
            window.handleFilterChange('color', this.checked)
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-6b3e461c"]').forEach(el => {
        el.addEventListener('change', function(event) {
            window.handleFilterChange('hl', this.checked)
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-bb736618"]').forEach(el => {
        el.addEventListener('change', function(event) {
            window.handleFilterChange('oe', this.checked)
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-3e3a62b8"]').forEach(el => {
        el.addEventListener('change', function(event) {
            window.handleFilterChange('doz', this.checked)
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-17bce550"]').forEach(el => {
        el.addEventListener('change', function(event) {
            window.handleFilterChange('col', this.checked)
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-8bd95be0"]').forEach(el => {
        el.addEventListener('change', function(event) {
            window.togglePatternSelection(this.checked)
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-01502c30"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.app.switchGameMode('roulette')
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-b38d2f3b"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.app.switchGameMode('baccarat')
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-45becf07"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.app.switchGameMode('dragontiger')
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-71d749ac"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.toggleStopwatchState()
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-1bf50149"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.resetStopwatch()
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-77a108ab"]').forEach(el => {
        el.addEventListener('change', function(event) {
            window.app.baccarat.runEngine()
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-b0faa796"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.app.baccarat.toggleModal('vault-modal'); window.app.roulette.toggleMainMenu(event)
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-c9ab30c5"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.app.baccarat.toggleModal('log-modal'); window.app.roulette.toggleMainMenu(event)
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-a63b26e8"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.app.baccarat.toggleModal('sim-modal'); window.app.roulette.toggleMainMenu(event)
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-c7219a35"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.app.baccarat.reset(); window.app.roulette.toggleMainMenu(event)
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-887d7b42"]').forEach(el => {
        el.addEventListener('change', function(event) {
            window.app.dragontiger.runEngine()
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-2780e5e7"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.app.dragontiger.toggleModal('dt-vault-modal'); window.app.roulette.toggleMainMenu(event)
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-1895f10b"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.app.dragontiger.toggleModal('dt-log-modal'); window.app.roulette.toggleMainMenu(event)
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-396bb27f"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.app.dragontiger.toggleModal('dt-sim-modal'); window.app.roulette.toggleMainMenu(event)
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-de5a95c8"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.app.dragontiger.reset(); window.app.roulette.toggleMainMenu(event)
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-b5a73eb4"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.toggleAccordion('acc-engine')
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-fe4bdaef"]').forEach(el => {
        el.addEventListener('change', function(event) {
            window.app.roulette.toggleIgnoreZero()
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-2b52f1f5"]').forEach(el => {
        el.addEventListener('change', function(event) {
            window.togglePerimeterOnly()
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-b214613f"]').forEach(el => {
        el.addEventListener('change', function(event) {
            window.app.roulette.updatePerimeter(this.value)
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-cf916add"]').forEach(el => {
        el.addEventListener('input', function(event) {
            window.app.roulette.updatePerimeter(this.value)
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-25144694"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.toggleAccordion('acc-grid')
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-c0f4ce12"]').forEach(el => {
        el.addEventListener('change', function(event) {
            window.toggleGridColumn('face')
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-7bb4ab5a"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.toggleFaceHud()
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-634ae44f"]').forEach(el => {
        el.addEventListener('change', function(event) {
            window.toggleGridColumn('hl')
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-147ba009"]').forEach(el => {
        el.addEventListener('change', function(event) {
            window.toggleGridColumn('oe')
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-dadb4894"]').forEach(el => {
        el.addEventListener('change', function(event) {
            window.toggleGridColumn('doz')
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-88d2887e"]').forEach(el => {
        el.addEventListener('change', function(event) {
            window.toggleGridColumn('col')
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-7fe35e6a"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.toggleAccordion('acc-bankroll')
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-47b24698"]').forEach(el => {
        el.addEventListener('change', function(event) {
            window.updateBankrollSettings()
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-359139bc"]').forEach(el => {
        el.addEventListener('change', function(event) {
            window.updateBankrollSettings()
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-620b1c21"]').forEach(el => {
        el.addEventListener('change', function(event) {
            window.updateBankrollSettings()
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-0396ad22"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.toggleAccordion('acc-data')
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-8d91a4e9"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.exportSpins()
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-6c9b50fd"]').forEach(el => {
        el.addEventListener('click', function(event) {
            document.getElementById('importInput').click()
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-94052cfd"]').forEach(el => {
        el.addEventListener('change', function(event) {
            window.importSpins(this.files)
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-da0bd07e"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.toggleAccordion('acc-cards')
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-6cfdb96d"]').forEach(el => {
        el.addEventListener('change', function(event) {
            window.toggleTrendIcons()
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-b888db1c"]').forEach(el => {
        el.addEventListener('change', function(event) {
            window.toggleCurvedLayout()
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-e6cd0b8b"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.toggleAccordion('acc-sound')
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-15b5e054"]').forEach(el => {
        el.addEventListener('change', function(event) {
            window.toggleSound('predictions')
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-0cac2258"]').forEach(el => {
        el.addEventListener('change', function(event) {
            window.toggleSound('wins')
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-da2e95b8"]').forEach(el => {
        el.addEventListener('change', function(event) {
            window.toggleSound('losses')
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-a37f6f03"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.showResetModal()
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-afa4d5a4"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.app.baccarat.toggleModal('sim-modal')
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-4d9099bc"]').forEach(el => {
        el.addEventListener('click', function(event) {
            event.stopPropagation()
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-54fbfe9d"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.app.baccarat.toggleModal('sim-modal')
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-667b86c0"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.app.baccarat.toggleSimConfig()
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-da839b94"]').forEach(el => {
        el.addEventListener('change', function(event) {
            window.app.baccarat.updateSim()
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-9daa8eca"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.app.baccarat.toggleSimConfig()
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-a4a65edd"]').forEach(el => {
        el.addEventListener('change', function(event) {
            window.app.baccarat.updateSim()
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-19399d79"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.app.baccarat.toggleModal('log-modal')
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-1a5a4290"]').forEach(el => {
        el.addEventListener('click', function(event) {
            event.stopPropagation()
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-9b548309"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.app.baccarat.toggleModal('log-modal')
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-e32a466c"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.app.baccarat.toggleModal('reset-modal-baccarat')
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-fc017f47"]').forEach(el => {
        el.addEventListener('click', function(event) {
            event.stopPropagation()
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-0255ed8f"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.app.baccarat.toggleModal('reset-modal-baccarat')
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-01379fd5"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.app.baccarat.executeReset()
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-cea1b31e"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.app.dragontiger.toggleModal('dt-sim-modal')
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-1f7592d2"]').forEach(el => {
        el.addEventListener('click', function(event) {
            event.stopPropagation()
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-d1dae6de"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.app.dragontiger.toggleModal('dt-sim-modal')
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-f43e7b4d"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.app.dragontiger.toggleSimConfig()
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-c5d0ba4c"]').forEach(el => {
        el.addEventListener('change', function(event) {
            window.app.dragontiger.updateSim()
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-7a3cdf16"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.app.dragontiger.toggleSimConfig()
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-3dd0462d"]').forEach(el => {
        el.addEventListener('change', function(event) {
            window.app.dragontiger.updateSim()
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-1a960012"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.app.dragontiger.toggleModal('dt-log-modal')
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-a38f59c9"]').forEach(el => {
        el.addEventListener('click', function(event) {
            event.stopPropagation()
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-67bc3d4e"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.app.dragontiger.toggleModal('dt-log-modal')
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-5e6eb48a"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.app.dragontiger.toggleModal('reset-modal-dragontiger')
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-bc49099c"]').forEach(el => {
        el.addEventListener('click', function(event) {
            event.stopPropagation()
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-da83f989"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.app.dragontiger.toggleModal('reset-modal-dragontiger')
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-09d22081"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.app.dragontiger.executeReset()
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-19639e25"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.createRipple(event); window.app.baccarat.input('P')
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-664bb996"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.createRipple(event); window.app.baccarat.input('T')
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-d6bc7f95"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.createRipple(event); window.app.baccarat.input('B')
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-2bc91956"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.createRipple(event); window.app.dragontiger.input('D')
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-5f896e8e"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.createRipple(event); window.app.dragontiger.input('X')
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-882467ba"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.createRipple(event); window.app.dragontiger.input('T')
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-d5c61084"]').forEach(el => {
        el.addEventListener('click', function(event) {
            if(event.target === this) window.app.roulette.closeResetModal()
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-3d6cee60"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.app.roulette.closeResetModal()
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-afdc5853"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.app.roulette.executeReset()
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-39e05a01"]').forEach(el => {
        el.addEventListener('click', function(event) {
            if(event.target === this) window.app.closeSwitchModeModal()
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-2df95490"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.app.closeSwitchModeModal()
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-9acf5518"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.app.executeSwitchMode()
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-664c591f"]').forEach(el => {
        el.addEventListener('click', function(event) {
            if(event.target === this) window.app.toggleAnalytics()
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-c3c46f12"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.switchAnalyticsMode('analytics')
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-bd7d1ad8"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.switchAnalyticsMode('perimeter')
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-27788667"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.switchAnalyticsMode('simulation')
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-8e15fc44"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.toggleAnalytics()
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-d2a8b721"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.app.roulette.switchAnalyticsTab('master')
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-d3fa7c0f"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.app.roulette.switchAnalyticsTab('1to1')
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-14f8c309"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.app.roulette.switchAnalyticsTab('2to1')
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-46e1b54b"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.app.roulette.toggleHeatmapMode('PATTERNS')
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-101acbbe"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.app.roulette.toggleHeatmapMode('CATEGORIES')
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-8247b65f"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.toggleHeatmapMetric()
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-e3ffb2ee"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.app.roulette.resetStats()
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-784db13b"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.app.roulette.toggleSimConfig()
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-94118a99"]').forEach(el => {
        el.addEventListener('change', function(event) {
            window.changeSimProgression(this.value)
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-7a9c971d"]').forEach(el => {
        el.addEventListener('change', function(event) {
            window.toggleSimFilter('cat', 'Color')
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-fdfd30ef"]').forEach(el => {
        el.addEventListener('change', function(event) {
            window.toggleSimFilter('cat', 'High/Low')
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-0adb9ed2"]').forEach(el => {
        el.addEventListener('change', function(event) {
            window.toggleSimFilter('cat', 'Odd/Even')
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-b121c9f6"]').forEach(el => {
        el.addEventListener('change', function(event) {
            window.toggleSimFilter('cat', 'Dozens')
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-df6949aa"]').forEach(el => {
        el.addEventListener('change', function(event) {
            window.toggleSimFilter('cat', 'Columns')
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-5571ca0c"]').forEach(el => {
        el.addEventListener('click', function(event) {
            if(event.target === this) window.app.roulette.toggleBetsModal()
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-618c2c23"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.clearVault('roulette')
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-cf2c506c"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.toggleBetsModal()
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-53a012f3"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.app.roulette.switchBetsTab('trend')
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-d177410d"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.app.roulette.switchBetsTab('analytics')
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-10bd1207"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.app.roulette.switchBetsTab('logs')
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-03446bd2"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.app.roulette.toggleUserHeatmapMode('PATTERNS')
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-2217409c"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.app.roulette.toggleUserHeatmapMode('CATEGORIES')
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-52f6b4bf"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.app.baccarat.toggleModal('filters-modal')
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-80b2eb6c"]').forEach(el => {
        el.addEventListener('click', function(event) {
            event.stopPropagation()
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-7471e11d"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.app.baccarat.toggleModal('filters-modal')
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-ded48fa0"]').forEach(el => {
        el.addEventListener('click', function(event) {
            if(event.target === this) window.app.roulette.closePatternLog()
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-3be7d497"]').forEach(el => {
        el.addEventListener('click', function(event) {
            closePatternLog()
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-c24700fa"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.app.dragontiger.toggleModal('dt-filters-modal')
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-c8a27727"]').forEach(el => {
        el.addEventListener('click', function(event) {
            event.stopPropagation()
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-17439fd3"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.app.dragontiger.toggleModal('dt-filters-modal')
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-d7c3fb2b"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.app.dragontiger.toggleModal('dt-vault-modal')
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-f0f30a87"]').forEach(el => {
        el.addEventListener('click', function(event) {
            event.stopPropagation()
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-cfafd2d2"]').forEach(el => {
        el.addEventListener('change', function(event) {
            window.app.dragontiger.renderVault()
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-7497883b"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.clearVault('dragontiger')
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-5dec50d5"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.app.dragontiger.toggleModal('dt-vault-modal')
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-39f9e0c8"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.app.dragontiger.toggleModal('dt-stats-modal')
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-fc35a411"]').forEach(el => {
        el.addEventListener('click', function(event) {
            event.stopPropagation()
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-cb0e877b"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.app.dragontiger.toggleModal('dt-stats-modal')
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-5f5b3d12"]').forEach(el => {
        el.addEventListener('click', function(event) {
            this.nextElementSibling.classList.toggle('hidden'); this.querySelector('i.fa-chevron-down, i.fa-chevron-up').classList.toggle('fa-chevron-down'); this.querySelector('i.fa-chevron-down, i.fa-chevron-up').classList.toggle('fa-chevron-up');
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-1f904a5c"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.app.baccarat.toggleModal('stats-modal')
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-6588e4ab"]').forEach(el => {
        el.addEventListener('click', function(event) {
            event.stopPropagation()
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-44c826d4"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.app.baccarat.toggleModal('stats-modal')
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-57e80937"]').forEach(el => {
        el.addEventListener('change', function(event) {
            window.app.baccarat.toggleCommission()
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-3bc0e63e"]').forEach(el => {
        el.addEventListener('click', function(event) {
            this.nextElementSibling.classList.toggle('hidden'); this.querySelector('i.fa-chevron-down, i.fa-chevron-up').classList.toggle('fa-chevron-down'); this.querySelector('i.fa-chevron-down, i.fa-chevron-up').classList.toggle('fa-chevron-up');
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-267126e4"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.app.baccarat.toggleModal('vault-modal')
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-4057e9f2"]').forEach(el => {
        el.addEventListener('click', function(event) {
            event.stopPropagation()
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-55c2a7bc"]').forEach(el => {
        el.addEventListener('change', function(event) {
            window.app.baccarat.renderVault()
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-a39951ee"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.clearVault('baccarat')
        });
    });

    document.querySelectorAll('[data-evt-bind="evt-bind-f09b0d3b"]').forEach(el => {
        el.addEventListener('click', function(event) {
            window.app.baccarat.toggleModal('vault-modal')
        });
    });
}
