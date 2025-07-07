# Front Proyecto Menchaca 
Proyecto frontend en Angular standalone para el sistema de gestión de citas y consultas médicas Menchaca.

---

## Tecnologías usadas

- **Angular CLI 19**  - Framework web
- **PrimeNG** - Para estilos
- **PrimeIcons** - PAra iconos 


---
## Requisitos

- Angular CLI 19
- Editor como Visual Studio Code 

---
## Clonar el repositorio

```bash
git clone https://github.com/Valeria-Miguel/front-menchaca.git
```
### ir al proyecto
```bash
cd front-menchaca
```
### instalar dependencias
```bash
npm install

# ejecutar el servidor
ng serve
```


## Estructura del Proyecto
```bash
src/
├── app/
│ ├── pages/
│ │ ├── auth/
│ │ │ ├── login/ ----------------------> Vista de inicio de sesión
│ │ │ │ ├── login.component.ts
│ │ │ │ ├── login.component.html
│ │ │ │ └── login.component.css -------> estilos de login 
│ │ │ ├── register/ ----------------------> Vista de regitro de paciente
│ │ │ │ ├── register.component.ts
│ │ │ │ ├── register.component.html
│ │ │ │ └── register.component.css
│ │ │ └── auth.routes.ts
│ │ └── dashboard/
│ │ ├── medico-dashboard.component.ts
│ │ ├── medico-dashboard.component.html
│ │ ├── medico-dashboard.component.css
│ │ └── dashboard.routes.ts
│ ├── app.routes.ts -----------------> Archivo de rutas globales
│ └── app.component.ts
├── assets/
│ └── img/
│ └── logo.png
├── index.html
├── main.ts -----> Aquí se arranca el módulo principal (AppComponent) y el sistema de rutas.
└── styles.css ----> Archivo global de estilos
```
--- 

## Características principales

- Vista de inicio de sesión 
- Vista de registro de pacientes
- Validaciones de campos 



