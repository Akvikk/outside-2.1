import re
import os

def process_files():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    # 1. Update index.html
    with open(os.path.join(base_dir, 'index.html'), 'r', encoding='utf-8') as f:
        html = f.read()

    # Find the dragontiger-modals-container block
    start_tag = '<div id="dragontiger-modals-container" class="hidden">'
    start_idx = html.find(start_tag)
    if start_idx == -1:
        print("Could not find dragontiger-modals-container")
        return
    
    end_tag = '    <script src="js/utils.js"></script>'
    end_idx = html.find(end_tag, start_idx)
    
    dt_modals_html = html[start_idx:end_idx]

    # IDs to prefix with dt-
    ids_to_prefix = [
        'filters-modal', 'stats-modal', 'vault-modal', 'log-modal', 'sim-modal',
        'filters-list', 'tab-kpis', 'tab-trend', 'tab-heatmap', 'tab-golden',
        'sec-kpis', 'kpi-hr', 'kpi-signals', 'kpi-net', 'comm-toggle',
        'sec-trend', 'graph-container', 'trend-hud', 'hud-w', 'hud-h', 'hud-l',
        'sec-heatmap', 'heatmap-body', 'sec-golden', 'golden-kpi-net', 'golden-kpi-hr',
        'golden-kpi-opps', 'golden-kpi-dd', 'golden-graph-container', 'golden-ledger-body',
        'sim-modal-content', 'sim-strategy', 'sim-active-text', 'sim-config-panel',
        'sim-toggle-ties', 'sim-filters-list', 'sim-kpi-net', 'sim-kpi-hr', 'sim-kpi-opps',
        'sim-kpi-dd', 'sim-graph-container', 'sim-hud-w', 'sim-hud-h', 'sim-hud-l',
        'sim-heatmap-body', 'vault-strategy', 'vault-modal-content', 'vault-kpi-net',
        'vault-kpi-hr', 'vault-kpi-opps', 'vault-kpi-dd', 'vault-graph-container',
        'vault-ledger-body', 'log-ledger-body'
    ]

    for element_id in ids_to_prefix:
        dt_modals_html = dt_modals_html.replace(f'id="{element_id}"', f'id="dt-{element_id}"')
        # Also fix any direct onclick references in the HTML block
        dt_modals_html = dt_modals_html.replace(f"toggleModal('{element_id}')", f"toggleModal('dt-{element_id}')")
        dt_modals_html = dt_modals_html.replace(f"toggleSimFilter('{element_id}'", f"toggleSimFilter('dt-{element_id}'")

    new_html = html[:start_idx] + dt_modals_html + html[end_idx:]
    
    # Wait, the main menu HTML also calls toggleModal for dragontiger!
    # Let's fix that too.
    # Search for "app.dragontiger.toggleModal('..." and prefix dt- except for reset-modal-dragontiger
    def replace_menu_calls(match):
        modal_name = match.group(1)
        if modal_name == 'reset-modal-dragontiger' or modal_name.startswith('dt-'):
            return match.group(0)
        return f"app.dragontiger.toggleModal('dt-{modal_name}')"
    
    new_html = re.sub(r"app\.dragontiger\.toggleModal\('([^']+)'\)", replace_menu_calls, new_html)

    with open(os.path.join(base_dir, 'index.html'), 'w', encoding='utf-8') as f:
        f.write(new_html)
    
    # 2. Update dragontiger.js
    with open(os.path.join(base_dir, 'js', 'dragontiger.js'), 'r', encoding='utf-8') as f:
        js = f.read()

    for element_id in ids_to_prefix:
        js = js.replace(f"getElementById('{element_id}')", f"getElementById('dt-{element_id}')")
        # Also if the modal name is referenced directly like toggleModal('vault-modal')
        js = js.replace(f"toggleModal('{element_id}')", f"toggleModal('dt-{element_id}')")

    with open(os.path.join(base_dir, 'js', 'dragontiger.js'), 'w', encoding='utf-8') as f:
        f.write(js)

    print("Namespacing complete.")

if __name__ == '__main__':
    process_files()
