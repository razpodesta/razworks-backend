#!/bin/bash

# Comprueba si los cambios afectan a la app web-admin o sus librerías dependientes
npx nx show projects --affected --base=HEAD~1 | grep "web-admin"

if [ $? -eq 0 ]; then
  # Proceed with the build
  echo "✅ Changes detected in web-admin. Proceeding with build."
  exit 1
else
  # Don't build
  echo "🛑 No changes in web-admin. Skipping build."
  exit 0
fi
