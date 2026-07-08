import re

with open('/home/bajrangi/Wins/Aegis-Vault/apps/web/components/sections/section2/V1Opener.tsx', 'r') as f:
    content = f.read()

content = re.sub(r"      className=\"absolute inset-0\"\n    >\n      \{children\}\n    </motion\.div>\n  \)\n\}\n\nfunction RunPanel", "function RunPanel", content)

with open('/home/bajrangi/Wins/Aegis-Vault/apps/web/components/sections/section2/V1Opener.tsx', 'w') as f:
    f.write(content)
