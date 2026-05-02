import re

header_path = 'src/components/layout/Header.astro'
with open(header_path, 'r', encoding='utf-8') as f:
    header = f.read()

# Patch Header frontmatter
header = re.sub(
    r"import { Menu, X, Phone, Clock } from 'lucide-react';",
    "import { Menu, X, Phone, Clock } from 'lucide-react';\nimport Logo from '../ui/Logo.astro';",
    header
)

# Patch main-navbar logo
header = re.sub(
    r'<!-- Logo -->\s*<a href="/" class="flex items-center gap-2\.5 group flex-shrink-0" aria-label="[^"]+">\s*<span class="text-4xl[^>]+>\s*Magsil\s*</span>\s*<span class="text-\[11px\][^>]+>\s*móveis\s*</span>\s*</a>',
    '<!-- Logo -->\n        <a href="/" class="flex-shrink-0 focus-ring rounded-[var(--radius-sm)]" aria-label={`${business.name} - Página inicial`}>\n          <Logo theme="light" />\n        </a>',
    header
)

# Patch mobile menu logo
header = re.sub(
    r'<div class="flex items-center gap-2\.5">\s*<span class="text-3xl[^>]+>Magsil</span>\s*<span class="text-\[11px\][^>]+>móveis</span>\s*</div>',
    '<a href="/" class="focus-ring rounded-[var(--radius-sm)]" aria-label={`${business.name} - Página inicial`}>\n          <Logo theme="light" class="scale-90 transform-origin-left" />\n        </a>',
    header
)

with open(header_path, 'w', encoding='utf-8') as f:
    f.write(header)

footer_path = 'src/components/layout/Footer.astro'
with open(footer_path, 'r', encoding='utf-8') as f:
    footer = f.read()

# Patch Footer frontmatter
footer = re.sub(
    r"import TikTokIcon from '../ui/icons/TikTokIcon\.astro';",
    "import TikTokIcon from '../ui/icons/TikTokIcon.astro';\nimport Logo from '../ui/Logo.astro';",
    footer
)

# Patch footer logo
footer = re.sub(
    r'<a\s*href="/"\s*class="inline-flex items-center gap-3 mb-5 group"\s*aria-label="[^"]+"\s*>\s*<span class="text-4xl[^>]+>\s*Magsil\s*</span>\s*<span class="text-sm[^>]+>\s*móveis\s*</span>\s*</a>',
    '<a\n            href="/"\n            class="inline-block mb-6 focus-ring rounded-[var(--radius-sm)]"\n            aria-label={`${business.name} — ir para o início`}\n          >\n            <Logo theme="dark" />\n          </a>',
    footer
)

with open(footer_path, 'w', encoding='utf-8') as f:
    f.write(footer)

print("Patch applied successfully.")
