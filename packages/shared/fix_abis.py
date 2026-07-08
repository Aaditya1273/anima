import re

with open('/home/bajrangi/Wins/Aegis-Vault/packages/shared/src/abis.ts', 'r') as f:
    content = f.read()

content = content.replace('src/*/contract.json', 'src/<wildcard>/contract.json')

with open('/home/bajrangi/Wins/Aegis-Vault/packages/shared/src/abis.ts', 'w') as f:
    f.write(content)

