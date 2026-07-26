import re
import os

files = [
    r'c:\Users\swaro\Desktop\test\forge-app\app\(tabs)\nutrition.tsx',
    r'c:\Users\swaro\Desktop\test\forge-app\app\(tabs)\training.tsx',
    r'c:\Users\swaro\Desktop\test\forge-app\app\(tabs)\discipline.tsx',
    r'c:\Users\swaro\Desktop\test\forge-app\app\(tabs)\appearance.tsx',
    r'c:\Users\swaro\Desktop\test\forge-app\app\(tabs)\index.tsx',
]

for f in files:
    try:
        with open(f, 'r', encoding='utf-8') as file:
            content = file.read()
        
        pattern = r'(const\s+toggle[a-zA-Z0-9_]*\s*=\s*(?:async\s*)?\([^)]*\)\s*=>\s*\{)'
        replacement = r'\1\n    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);'
        
        new_content, count = re.subn(pattern, replacement, content)
        
        if count > 0:
            if 'import * as Haptics' not in new_content:
                new_content = 'import * as Haptics from "expo-haptics";\n' + new_content
            
            with open(f, 'w', encoding='utf-8') as file:
                file.write(new_content)
            print(f'Injected haptics in {f} ({count} times)')
    except Exception as e:
        print(f'Failed {f}: {e}')
