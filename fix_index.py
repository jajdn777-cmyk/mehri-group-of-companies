import re

with open('index.tsx', 'r') as f:
    content = f.read()

# Pattern for getSEOTitle
pattern = r'  // Helper for dynamic SEO titles\s+const getSEOTitle = \(\) => \{[^}]+\};'

# Find all occurrences
matches = list(re.finditer(pattern, content, re.DOTALL))

if len(matches) > 1:
    # Keep only the last one (usually near the return statement)
    last_match = matches[-1]

    # Remove all but the last one
    new_content = content
    for m in reversed(matches[:-1]):
        new_content = new_content[:m.start()] + new_content[m.end():]

    with open('index.tsx', 'w') as f:
        f.write(new_content)
    print(f"Removed {len(matches) - 1} duplicate getSEOTitle definitions.")
else:
    print("No duplicates found or pattern didn't match multiple times.")
