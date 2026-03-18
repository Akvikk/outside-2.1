import os

def cleanup():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    
    orphaned_files = [
        "Roads.js", "Dashboard.js", "Modals.js", "DragonTigerUI.js", "DragonTigerController.js",
        "Flow.js", "ZigZag.js", "FalseBreak.js", "Build123.js", "Mirror321.js", "Burst113.js", 
        "Down311.js", "PatternScanner.js", "ConvergenceCalc.js", "RoadGenerator.js", "Progression.js", 
        "Simulator.js", "config.js", "DragonTigerState.js", "BaccaratUI.js", "BaccaratController.js", 
        "BaccaratState.js", "Build112.js", "BankrollManager.js", "Formatters.js", "HistoryGrid.js", 
        "DashboardCards.js", "TrendGraph.js"
    ]

    for file in orphaned_files:
        path = os.path.join(root_dir, file)
        if os.path.exists(path):
            os.remove(path)
            print(f"Removed orphaned file: {file}")
            
if __name__ == '__main__':
    cleanup()