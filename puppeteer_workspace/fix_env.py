import re
import sys

filepath = '/home/ubuntu/aitoearn/docker-compose.yml'

with open(filepath, 'r') as f:
    content = f.read()

# Replace ANTHROPIC_API_KEY (only in AI service section)
content = content.replace(
    'ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY:-sk-placeholder}',
    'ANTHROPIC_API_KEY: sk-cp-vVYM7B9nZGff1HrfVBtXJ2b2UdUdbv5aQb5K_t8jPhX6_EdfQCpgTCF7--Uoq27s_ROEGm7bAZ0_8eMCHpI8OlmiX1vRG2lN7cU1T0kLC5CYi_hYEsWZSUc'
)

# Replace ANTHROPIC_BASE_URL
content = content.replace(
    'ANTHROPIC_BASE_URL: ${ANTHROPIC_BASE_URL:-https://api.anthropic.com}',
    'ANTHROPIC_BASE_URL: https://api.minimaxi.com/anthropic'
)

with open(filepath, 'w') as f:
    f.write(content)

print('DONE - Updated ANTHROPIC_API_KEY and ANTHROPIC_BASE_URL for MiniMax')
