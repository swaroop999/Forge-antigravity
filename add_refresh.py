import re

files = [
    r'c:\Users\swaro\Desktop\test\forge-app\app\(tabs)\nutrition.tsx',
    r'c:\Users\swaro\Desktop\test\forge-app\app\(tabs)\training.tsx',
    r'c:\Users\swaro\Desktop\test\forge-app\app\(tabs)\discipline.tsx',
    r'c:\Users\swaro\Desktop\test\forge-app\app\(tabs)\appearance.tsx',
]

for f in files:
    try:
        with open(f, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # We need to add refreshControl={<RefreshControl refreshing={false} onRefresh={() => {}} tintColor={colors.primary} />}
        # to the main ScrollView in each file.
        
        # Most of these files have a ScrollView in the main component:
        # e.g., <ScrollView style={{ flex: 1 }}> or similar
        # Let's replace the first ScrollView that wraps the content, if it doesn't already have RefreshControl
        
        if 'RefreshControl' not in content and 'import ' in content:
            # Add import
            content = re.sub(r'import\s+\{([^}]+)\}\s+from\s+[\'"]react-native[\'"]', r'import {\1, RefreshControl} from "react-native"', content, count=1)
        
        if 'refreshControl=' not in content:
            # Simple regex to find the first ScrollView after ScreenContainer
            # Actually, `training.tsx`, etc. might have it in the main component.
            content = re.sub(r'(<ScreenContainer>\s*<View style=\{\{ flex: 1 \}\}>\s*<ScrollView)\s', r'\1 refreshControl={<RefreshControl refreshing={false} onRefresh={() => {}} tintColor={colors.primary} />} ', content, count=1)
            # Or if it's not wrapped in a View
            content = re.sub(r'(<ScreenContainer>\s*<ScrollView)\s', r'\1 refreshControl={<RefreshControl refreshing={false} onRefresh={() => {}} tintColor={colors.primary} />} ', content, count=1)
        
        with open(f, 'w', encoding='utf-8') as file:
            file.write(content)
        print(f'Updated {f}')
    except Exception as e:
        print(f'Failed {f}: {e}')
