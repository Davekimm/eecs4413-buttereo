#!/bin/bash

# 1. Define the content (This uses the "pretty" version we created)
README_CONTENT="# 🧈 Buttereo E-Commerce Platform

A robust, full-stack e-commerce application.

## 🚀 Tech Stack
- **Backend:** Spring Boot (Port 8080)
- **Frontend:** React + Vite (Port 5173)
- **Database:** MySQL

## 🛠️ Quick Start
1. Update \`src/main/resources/application.properties\` with your DB credentials.
2. Run MySQL and execute scripts in \`/db\`.
3. Start Backend via IntelliJ.
4. In \`/front/buttereo\`, run \`npm install\` and \`npm run dev\`.

## 🔐 Admin Access
- **User:** dk
- **Pass:** 123"

# 2. Write the content to the README.md file
echo "$README_CONTENT" > README.md

echo "✅ README.md has been updated locally."

# 3. Optional: Auto-push to GitHub
read -p "Push changes to GitHub? (y/n): " confirm
if [ "$confirm" == "y" ]; then
    git add README.md
    git commit -m "docs: update readme structure"
    git push
    echo "🚀 Changes pushed to GitHub!"
else
    echo "📂 Changes saved locally only."
fi
