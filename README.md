
## Project description
I used <i>Springboot</i> for backend, <i>React</i> for frontend, and <i>MySQL</i> for DB.

`./Backend` contains ***backend Springboot project***

`./Frontend` contains ***frontend React project*** 

`./db` contains ***SQL script***.

## To test it locally...
1. Download and unzip the project file.
   
2. Open the backend Springboot project `./Backend` in IDE. (I used IntelliJ 2026.1)
   
3. Please change db properties in `.Backend/src/main/resources/application.properties` to your local DB setting.
   - URL with db schema name, username, and password are necessary.
<p align="center">
  <img width="550" height="270" alt="application properties setup" src="https://github.com/user-attachments/assets/4199e012-fa95-47c8-b309-75f8900f6311" />
</p>

4. Run the MySQL.

5. Run the backend (port#: 8080). 
   - ***Tables and default admin/user accounts will be generated automatically***.
   - Please check the terminal if the default accounts are created properly.
6. Open the frontend React project `./Frontend` in another IDE.
   
7. Type `npm install` in the terminal to install node_mudules.
    
8. Type `npm run dev` in the terminal to run Vite (port#: 5173).

## default credential for the website
Admin - username: dk / password: 123

User - username: qwe / password: 123
