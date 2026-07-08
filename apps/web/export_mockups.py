import os

files = {
    'V2Identity.tsx': 'function CertificateCard',
    'V3Brain.tsx': 'function EnclaveCard',
    'V4Memory.tsx': 'function MemoryBrowser',
    'V5Limbs.tsx': 'function LimbsTerminal',
    'V6Comms.tsx': 'function CommsVisualizer',
    'V7Economy.tsx': 'function EconomyTerminal',
}

base_dir = '/home/bajrangi/Wins/Aegis-Vault/apps/web/components/sections/section2'

for fname, func_name in files.items():
    path = os.path.join(base_dir, fname)
    with open(path, 'r') as f:
        content = f.read()
    
    # Export the component
    content = content.replace(func_name, f"export {func_name}")
    
    with open(path, 'w') as f:
        f.write(content)

print("Exported mockups!")
