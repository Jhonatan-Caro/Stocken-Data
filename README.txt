Usuario de Ubuntu: stocken - Contraseña: 1123860023stocken

Cada vez que se haga cambio en el backend se debe levantar nuevamente el contenedor:
	docker compose up --build

Es necesario instalar las dependencias de node directamente en el Docker file (npm install).
Si se hace uso de variables de entorno en el proyecto, igual se debe eliminar la llamada al archivo .env,
no es encesario modificar todo el proyecto para borrar el objeto, simplemente se modifica en el archivo .yml de Docker las varibales con el mismo nombre, para que el backend no tenga problemas al llamarlas.

Si hay problemas y se necesita reiniciar todo los conetenedores escribir:
	- docker compose down
	- docker volumen prume
	- "Corregir docker-compose.yml"
	- Nuevamente levantarlo "docker compose up --build"

Puede ocurrir un problema al intentar utilizar una interfaz para ver la bd, en mi caso estaba intentado conectarme a la bd que levante con el docker con pgAdmin, un gestor, sin embargo tenia problemas con el puerto por pruebas anteriores, utilice los siguientes comandos para detener los servicio que corren en el puerto.
	- Enlistar los servicios para ver el PID del servicio:
		netstat -ano | findstr :5432
	- Eliminar el proceso según el PID
		taskkill /PID numero_de_PID /F