#!/bin/bash
find /home/ubuntu/aitoearn -name ".npmrc" | while read -r f; do
  echo "Processing file: $f"
  if grep -q "registry=" "$f"; then
    sed -i 's|registry=https://registry.npmjs.org/|registry=https://registry.npmmirror.com|g' "$f"
    sed -i 's|registry=https://registry.npmjs.org|registry=https://registry.npmmirror.com|g' "$f"
  else
    echo "registry=https://registry.npmmirror.com" >> "$f"
  fi
done
