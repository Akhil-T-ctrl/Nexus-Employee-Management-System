\# Nexus EMS — Enterprise Management System



Nexus EMS is a production-grade, full-stack enterprise platform designed to manage corporate structures, department hierarchies, and personnel lifecycles. Built with a secured \*\*Spring Boot REST API\*\* and a \*\*React\*\* frontend, this platform showcases advanced \*\*Role-Based Access Control (RBAC)\*\* in a live cloud environment.



\### 🌐 Live Production Links

\* \*\*Live Website:\*\* https://nexus-ems-akhil.netlify.app



-------------------------------------------------------



\## 🔐 Interactive Testing Credentials



To explore how the system enforces strict data boundaries and features based on roles, use these production credentials to log in:



\### 1. The Admin Experience

\* \*\*Username:\*\* admin

\* \*\*Password:\*\* admin123

\* \*\*What to check out:\*\* As an Admin, you hold global privileges. Try creating new \*\*Departments\*\* (e.g., Engineering, General management ), creating \*\*Managers\*\*, and assigning managers to handle distinct corporate sectors. Notice the global metric cards on the main dashboard. As an admin you can create employees inside a department , edit details of manager and employees . You can also delete a manager ( but only if the manager you want to delete doesn't have any departments under him ) . You can reassign a manager to a department , by clicking Global departments dashboard at top beside manager matrix button . You can delete a department too ( Notice : when you delete a department - all employees under it and budget requests made by them also vanish ) . You can also delete a employee inside a department ( by doing it all budget requests made by him also vanish ) 



\### 2. The Manager Experience

\* \*\*Username:\*\* manager\_arisu

\* \*\*Password:\*\* arisu@123

\* \*\*What to check out:\*\* Log in to see a scope-restricted dashboard. Managers can only view, manage, and edit \*\*Employee budget requests -i.e to Approve or Reject a request\*\* belonging to their specific department. When you approve a budget request , you can see bar graph changing smoothly above ( the bar represents percentage of funds used till now ). The global settings and cross-department panels are automatically hidden and protected by route guards. Important : Even the Admin cannot approve/reject a budget request - this feature is exclusive to the manager



Other usernames of managers if you want to take a look - manager\_usagi, manager\_harmony, manager\_rhaenys ; passwords are their-name@123 ; ex : for manager\_usagi - password is usagi@123 . Similar for other managers 



\### 3. The Employee Experience

\* \*\*Username:\*\* rob

\* \*\*Password:\*\* rob@123

\* \*\*What to check out:\*\* Employees land on a completely read-only, personal profile view. They can look up their own designation, department details, and structural status, but all administrative mutating controls are entirely stripped from the UI. They can make budget requests ( which can be only approved or rejected by a manager ) 



other usernames if you want to login into : chisiya, sansa , rickon , alicent , hikari , mark , helly , gemma , ann ;  passwords are username@123 ; ex - for chisiya : chisiya@123



---



\## 🛠️ System Architecture \& Under-The-Hood Highlights



While navigating the dashboards, the system is executing several engineering patterns behind the scenes:



\* \*\*Stateless API Security:\*\* Every dashboard action issues a request to the Spring Boot API, validated continuously via \*\*Spring Security\*\* and stateless \*\*JWT tokens\*\* sent in authorization headers.

\* \*\*CORS Protection \& API Routing:\*\* The frontend utilizes a dynamic config layer (`import.meta.env`) that routes requests smoothly to our cloud-hosted container on \*\*Render\*\*, communicating flawlessly with a \*\*MySQL cluster on Aiven Cloud\*\*.

\* \*\*Idempotent Data Seeding:\*\* The backend features a self-healing seeder block. On startup, it programmatically verifies database user states using Lombok's builder patterns, initializing the core environment structures automatically if missing.



---



\## 💻 Tech Stack Summary



\* \*\*Frontend:\*\* React.js, Tailwind CSS, Axios Interceptors

\* \*\*Backend:\*\* Java, Spring Boot 4.x, Spring Data JPA, Hibernate

\* \*\*Security:\*\* Spring Security, JSON Web Tokens (JWT)

\* \*\*Infrastructure:\*\* MySQL (Aiven Cloud), Netlify (Static Hosting), Render (Web Service Container)



---



\## 📜 License

Distributed under the MIT License.

