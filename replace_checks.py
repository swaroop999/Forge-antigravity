import re
import os

files = [
    r'c:\Users\swaro\Desktop\test\forge-app\app\(tabs)\nutrition.tsx',
    r'c:\Users\swaro\Desktop\test\forge-app\app\(tabs)\training.tsx',
    r'c:\Users\swaro\Desktop\test\forge-app\app\(tabs)\index.tsx',
    r'c:\Users\swaro\Desktop\test\forge-app\app\(tabs)\discipline.tsx',
    r'c:\Users\swaro\Desktop\test\forge-app\app\(tabs)\appearance.tsx',
]

for f in files:
    try:
        with open(f, 'r', encoding='utf-8') as file:
            content = file.read()
        
        new_content = re.sub(r'<Text[^>]*>✓</Text>', r'<Check size={14} color="#000" />', content)
        
        if new_content != content:
            if 'Check' not in content:
                # Add Check to lucide-react-native imports
                # This simple regex assumes the import is single-line, which it is.
                new_content = re.sub(r'(import\s+\{([^}]+)\}\s+from\s+[\'"]lucide-react-native[\'"])', r'import {\2, Check} from "lucide-react-native"', new_content)
                
            with open(f, 'w', encoding='utf-8') as file:
                file.write(new_content)
            print(f'Updated {f}')
    except Exception as e:
        print(f'Failed {f}: {e}')
