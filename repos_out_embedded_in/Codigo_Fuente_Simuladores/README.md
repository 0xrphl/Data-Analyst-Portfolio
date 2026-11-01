# Proyecto de Grado - Universidad Tecnológica de Pereira (UTP)
**Título:** Gemelos Digitales Hidrodinámicos 3D para experimentación en mecánica de fluidos
**Autor:** Rafael Sanchez Rueda
**Programa:** Ingeniería Mecánica

## Estructura del Proyecto
Este directorio contiene todos los entregables formales de la propuesta de trabajo de grado:
- **`Documento_Principal/`**: Contiene la propuesta oficial en formato `.docx` validada con el formato de registro y ficha técnica de la UTP.
- **`Anexos_y_Guias/`**: Copias de las guías de laboratorio oficiales y los informes de laboratorio (Bernoulli e Impacto de Chorro) validados en las sesiones de septiembre de 2026.
- **`Evidencias_Visuales/`**: Capturas de pantalla del simulador y gráficas analíticas y metrológicas.
- **`Codigo_Fuente_Simuladores/`**: Código fuente de la plataforma en blanco de React Three Fiber, aislado y listo para ejecutarse o empaquetarse.

## Cómo ejecutar el código fuente de los simuladores
El código está construido usando React, WebGL (Three.js/React Three Fiber) y JavaScript puro (ES6+) para los solvers matemáticos.

### Requisitos
- **Node.js** (v16 o superior). Puedes descargarlo desde [https://nodejs.org/](https://nodejs.org/).

### Pasos
1. Abre una terminal (PowerShell o CMD).
2. Navega hacia la carpeta del código fuente:
   ```bash
   cd Codigo_Fuente_Simuladores
   ```
3. Instala las dependencias locales del proyecto:
   ```bash
   npm install
   ```
4. Inicia el servidor local de desarrollo:
   ```bash
   npm run dev
   ```
5. La terminal te arrojará una dirección (usualmente `http://localhost:5173/`). Ábrela en tu navegador para interactuar con los gemelos digitales.

---
_Elaborado bajo los parámetros de modalidad de investigación formativa (Acuerdo 15 de 2015 del Consejo de Facultad de Ingeniería Mecánica, UTP)._